import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { DashboardHeader } from "@/components/DashboardHeader";

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("TEACHER");
  const [school, formTeacherClassCount] = await Promise.all([
    prisma.school.findUniqueOrThrow({ where: { id: user.schoolId! } }),
    prisma.class.count({ where: { schoolId: user.schoolId!, formTeacherId: user.id } }),
  ]);

  const navLinks = [
    { href: "/teacher", label: "Overview" },
    { href: "/teacher/scores", label: "Scores" },
  ];
  if (formTeacherClassCount > 0) {
    navLinks.push(
      { href: "/teacher/attendance", label: "Attendance" },
      { href: "/teacher/fees", label: "Fees" }
    );
  }

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-slate-50">
      <DashboardHeader roleLabel="Teacher" userName={user.name} schoolName={school.name} navLinks={navLinks} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
