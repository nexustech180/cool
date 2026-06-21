import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { JWT } from "next-auth/jwt";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { SUPER_ADMIN_PASSKEY, type Role } from "@/lib/types";

// referenced so the "next-auth/jwt" augmentation below can attach to the module
export type { JWT };

declare module "next-auth" {
  interface User {
    role: Role;
    schoolId: string | null;
    mustChangePassword: boolean;
  }
  interface Session {
    user: {
      id: string;
      name: string;
      role: Role;
      schoolId: string | null;
      mustChangePassword: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    schoolId: string | null;
    mustChangePassword: boolean;
  }
}

// Shared by the Credentials provider (which also verifies the password) and the
// login action (which uses it to pick a redirect target before signing in, so the
// login redirect is a single hop instead of bouncing through "/").
export function findUserForLogin(phone: string, passkey: string) {
  const isSuperAdminLogin = passkey.toLowerCase() === SUPER_ADMIN_PASSKEY;
  return isSuperAdminLogin
    ? prisma.user.findFirst({ where: { phone, role: "SUPER_ADMIN", schoolId: null } })
    : prisma.user.findFirst({ where: { phone, school: { passkey: passkey.toUpperCase() } } });
}

export const { handlers, auth, signIn, signOut, unstable_update } = NextAuth({
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      credentials: {
        phone: {},
        passkey: {},
        password: {},
      },
      async authorize(credentials) {
        const phone = String(credentials?.phone ?? "").trim();
        const passkey = String(credentials?.passkey ?? "").trim();
        const password = String(credentials?.password ?? "");

        if (!phone || !passkey || !password) return null;

        const user = await findUserForLogin(phone, passkey);

        if (!user) return null;

        const passwordValid = await bcrypt.compare(password, user.passwordHash);
        if (!passwordValid) return null;

        return {
          id: user.id,
          name: user.name,
          role: user.role as Role,
          schoolId: user.schoolId,
          mustChangePassword: user.mustChangePassword,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
        token.schoolId = user.schoolId;
        token.mustChangePassword = user.mustChangePassword;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.name = token.name ?? "";
      session.user.role = token.role;
      session.user.schoolId = token.schoolId;
      session.user.mustChangePassword = token.mustChangePassword;
      return session;
    },
  },
});
