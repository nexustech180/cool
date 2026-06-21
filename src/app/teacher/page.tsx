import Link from "next/link";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getExamWeight } from "@/lib/grading";

export default async function TeacherOverviewPage() {
  const user = await requireRole("TEACHER");
  const schoolId = user.schoolId!;

  const [assignments, formTeacherClasses, weightage] = await Promise.all([
    prisma.teacherAssignment.findMany({
      where: { schoolId, teacherId: user.id },
      orderBy: [{ class: { name: "asc" } }, { subject: { name: "asc" } }],
      include: { class: true, subject: true },
    }),
    prisma.class.findMany({ where: { schoolId, formTeacherId: user.id }, orderBy: { name: "asc" } }),
    prisma.weightageSetting.findUnique({ where: { schoolId } }),
  ]);

  const classScoreWeight = weightage?.classScoreWeight ?? 40;
  const examWeight = getExamWeight(classScoreWeight);

  const byClass = new Map<string, { className: string; subjects: string[] }>();
  for (const assignment of assignments) {
    const existing = byClass.get(assignment.classId);
    if (existing) {
      existing.subjects.push(assignment.subject.name);
    } else {
      byClass.set(assignment.classId, { className: assignment.class.name, subjects: [assignment.subject.name] });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Overview</h1>
        <p className="mt-1 text-sm text-slate-500">Your classes, subjects, and quick links.</p>
      </div>

      {formTeacherClasses.length > 0 && (
        <Card>
          <CardBody className="flex flex-wrap items-center gap-3">
            <Badge tone="indigo">Form teacher</Badge>
            <p className="text-sm text-slate-700">
              You are the form teacher of{" "}
              <span className="font-medium">{formTeacherClasses.map((klass) => klass.name).join(", ")}</span>. Use
              the Attendance and Fees tabs to record those for your class.
            </p>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader title="Score weightage" subtitle="Set by your School Admin. Applies when you enter scores." />
        <CardBody>
          <p className="text-sm text-slate-700">
            Class score counts for <span className="font-semibold">{classScoreWeight}%</span>, exam score counts for{" "}
            <span className="font-semibold">{examWeight}%</span> of the total.
          </p>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Your classes and subjects" />
        <CardBody className="flex flex-col gap-3">
          {byClass.size === 0 ? (
            <p className="text-sm text-slate-500">You have not been assigned to any class or subject yet.</p>
          ) : (
            Array.from(byClass.values()).map((entry) => (
              <div key={entry.className} className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-medium text-slate-900">{entry.className}</span>
                <span className="text-slate-400">—</span>
                {entry.subjects.map((subject) => (
                  <Badge key={subject} tone="slate">
                    {subject}
                  </Badge>
                ))}
              </div>
            ))
          )}
        </CardBody>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/teacher/scores">
          <Card className="h-full transition-shadow hover:shadow-md">
            <CardBody>
              <p className="font-medium text-slate-900">Enter scores</p>
              <p className="mt-1 text-sm text-slate-500">Record class and exam scores for your subjects.</p>
            </CardBody>
          </Card>
        </Link>
        {formTeacherClasses.length > 0 && (
          <>
            <Link href="/teacher/attendance">
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardBody>
                  <p className="font-medium text-slate-900">Attendance</p>
                  <p className="mt-1 text-sm text-slate-500">Record days present for your class.</p>
                </CardBody>
              </Card>
            </Link>
            <Link href="/teacher/fees">
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardBody>
                  <p className="font-medium text-slate-900">Fees</p>
                  <p className="mt-1 text-sm text-slate-500">Record fee payments for your class.</p>
                </CardBody>
              </Card>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
