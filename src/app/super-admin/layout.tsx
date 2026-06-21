import { requireRole } from "@/lib/session";
import { DashboardHeader } from "@/components/DashboardHeader";

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("SUPER_ADMIN");

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-slate-50">
      <DashboardHeader
        roleLabel="Super Admin"
        userName={user.name}
        navLinks={[
          { href: "/super-admin", label: "Overview" },
          { href: "/super-admin/schools", label: "Schools" },
        ]}
      />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
