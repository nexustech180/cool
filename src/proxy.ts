import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dashboardPathForRole, type Role } from "@/lib/types";

const ROLE_PREFIXES: { prefix: string; role: Role }[] = [
  { prefix: "/super-admin", role: "SUPER_ADMIN" },
  { prefix: "/school-admin", role: "SCHOOL_ADMIN" },
  { prefix: "/teacher", role: "TEACHER" },
  { prefix: "/parent", role: "PARENT" },
];

export default auth((req) => {
  const { nextUrl } = req;
  const session = req.auth;
  const isLoggedIn = !!session?.user;
  const path = nextUrl.pathname;

  const matchedRole = ROLE_PREFIXES.find((r) => path.startsWith(r.prefix));

  if (matchedRole) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", nextUrl);
      loginUrl.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(loginUrl);
    }
    if (session.user.role !== matchedRole.role) {
      return NextResponse.redirect(new URL(dashboardPathForRole(session.user.role), nextUrl));
    }
    if (session.user.mustChangePassword && path !== "/change-password") {
      return NextResponse.redirect(new URL("/change-password", nextUrl));
    }
  }

  if ((path === "/login" || path === "/") && isLoggedIn) {
    if (session.user.mustChangePassword) {
      return NextResponse.redirect(new URL("/change-password", nextUrl));
    }
    return NextResponse.redirect(new URL(dashboardPathForRole(session.user.role), nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
