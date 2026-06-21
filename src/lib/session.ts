import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { dashboardPathForRole, type Role } from "@/lib/types";

// Defense-in-depth alongside src/proxy.ts — Next.js recommends not relying on
// proxy alone for authorization (server functions can be called directly).
export async function requireRole(role: Role) {
  const session = await auth();
  if (!session?.user) redirect(`/login?callbackUrl=${dashboardPathForRole(role)}`);
  if (session.user.role !== role) redirect(dashboardPathForRole(session.user.role));
  if (session.user.mustChangePassword) redirect("/change-password");
  return session.user;
}

export async function requireSession() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session.user;
}
