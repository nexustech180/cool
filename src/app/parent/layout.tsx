import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { DashboardHeader } from "@/components/DashboardHeader";

export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("PARENT");
  const school = await prisma.school.findUniqueOrThrow({ where: { id: user.schoolId! } });

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-slate-50">
      <DashboardHeader
        roleLabel="Parent"
        userName={user.name}
        schoolName={school.name}
        navLinks={[{ href: "/parent", label: "My Children" }]}
      />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
