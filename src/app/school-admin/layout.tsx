import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { DashboardHeader } from "@/components/DashboardHeader";

export default async function SchoolAdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("SCHOOL_ADMIN");
  const school = await prisma.school.findUniqueOrThrow({ where: { id: user.schoolId! } });

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-slate-50">
      <DashboardHeader
        roleLabel="School Admin"
        userName={user.name}
        schoolName={school.name}
        navLinks={[
          { href: "/school-admin", label: "Overview" },
          { href: "/school-admin/classes", label: "Classes" },
          { href: "/school-admin/subjects", label: "Subjects" },
          { href: "/school-admin/terms", label: "Terms" },
          { href: "/school-admin/grading", label: "Grading" },
          { href: "/school-admin/staff", label: "Staff" },
        ]}
      />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
