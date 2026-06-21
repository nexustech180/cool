import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { TermPicker } from "@/components/TermPicker";
import { computeAttendancePercent } from "@/lib/grading";

export default async function ParentAttendancePage({
  params,
  searchParams,
}: {
  params: Promise<{ studentId: string }>;
  searchParams: Promise<{ termId?: string }>;
}) {
  const user = await requireRole("PARENT");
  const schoolId = user.schoolId!;
  const { studentId } = await params;
  const { termId: termIdParam } = await searchParams;

  const student = await prisma.student.findFirst({
    where: { id: studentId, schoolId, parentId: user.id },
    include: { class: true },
  });
  if (!student) notFound();

  const header = (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Attendance</h1>
        <p className="mt-1 text-sm text-slate-500">
          {student.fullName} — {student.class.name}
        </p>
      </div>
      <Link href="/parent" className="text-sm font-medium text-indigo-600 hover:underline">
        ← My children
      </Link>
    </div>
  );

  const terms = await prisma.term.findMany({ where: { schoolId }, orderBy: { startDate: "desc" } });
  if (terms.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        {header}
        <Card>
          <CardBody>
            <p className="text-sm text-slate-500">No terms have been set up yet.</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  const activeTerm = terms.find((t) => t.isActive);
  const selectedTerm = terms.find((t) => t.id === termIdParam) ?? activeTerm ?? terms[0];

  const attendance = await prisma.attendance.findFirst({
    where: { studentId: student.id, termId: selectedTerm.id },
  });

  const percent = attendance ? computeAttendancePercent(attendance.daysPresent, selectedTerm.totalDays) : null;

  return (
    <div className="flex flex-col gap-6">
      {header}

      {terms.length > 1 && (
        <Card>
          <CardBody>
            <TermPicker terms={terms} termId={selectedTerm.id} basePath={`/parent/attendance/${student.id}`} />
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader title={selectedTerm.name} />
        <CardBody>
          {!attendance ? (
            <p className="text-sm text-slate-500">No attendance recorded for this term yet.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-200 p-4">
                <p className="text-xs font-medium uppercase text-slate-500">Days present</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{attendance.daysPresent}</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <p className="text-xs font-medium uppercase text-slate-500">Total days</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{selectedTerm.totalDays}</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <p className="text-xs font-medium uppercase text-slate-500">Attendance rate</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{percent !== null ? `${percent.toFixed(1)}%` : "—"}</p>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
