import Link from "next/link";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";

export default async function SchoolAdminOverviewPage() {
  const user = await requireRole("SCHOOL_ADMIN");
  const schoolId = user.schoolId!;

  const [classCount, subjectCount, teacherCount, studentCount, activeTerm] = await Promise.all([
    prisma.class.count({ where: { schoolId } }),
    prisma.subject.count({ where: { schoolId } }),
    prisma.user.count({ where: { schoolId, role: "TEACHER" } }),
    prisma.student.count({ where: { schoolId } }),
    prisma.term.findFirst({ where: { schoolId, isActive: true } }),
  ]);

  const stats = [
    { label: "Classes", value: classCount },
    { label: "Subjects", value: subjectCount },
    { label: "Teachers", value: teacherCount },
    { label: "Students", value: studentCount },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Overview</h1>
        <p className="mt-1 text-sm text-slate-500">A snapshot of your school on SchoolHub.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardBody>
              <p className="text-sm text-slate-500">{stat.label}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{stat.value}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader
          title="Active term"
          action={
            <Link href="/school-admin/terms" className="text-sm font-medium text-indigo-600 hover:underline">
              Manage terms →
            </Link>
          }
        />
        <CardBody>
          {activeTerm ? (
            <p className="text-sm text-slate-700">
              <span className="font-medium">{activeTerm.name}</span> —{" "}
              {activeTerm.startDate.toLocaleDateString()} to {activeTerm.endDate.toLocaleDateString()} (
              {activeTerm.totalDays} days)
            </p>
          ) : (
            <p className="text-sm text-slate-500">
              No active term set. Attendance, fees, and report cards need an active term.
            </p>
          )}
        </CardBody>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/school-admin/classes">
          <Card className="h-full transition-shadow hover:shadow-md">
            <CardBody>
              <p className="font-medium text-slate-900">Classes</p>
              <p className="mt-1 text-sm text-slate-500">Manage classes and form teachers.</p>
            </CardBody>
          </Card>
        </Link>
        <Link href="/school-admin/grading">
          <Card className="h-full transition-shadow hover:shadow-md">
            <CardBody>
              <p className="font-medium text-slate-900">Grading</p>
              <p className="mt-1 text-sm text-slate-500">Set score weightage and grade boundaries.</p>
            </CardBody>
          </Card>
        </Link>
        <Link href="/school-admin/staff">
          <Card className="h-full transition-shadow hover:shadow-md">
            <CardBody>
              <p className="font-medium text-slate-900">Staff</p>
              <p className="mt-1 text-sm text-slate-500">Add teachers and assign subjects.</p>
            </CardBody>
          </Card>
        </Link>
      </div>
    </div>
  );
}
