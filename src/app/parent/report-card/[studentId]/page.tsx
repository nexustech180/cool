import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge, gradeTone } from "@/components/ui/Badge";
import { TermPicker } from "@/components/TermPicker";
import { findGradeForPercent } from "@/lib/grading";

export default async function ReportCardPage({
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
        <h1 className="text-2xl font-bold text-slate-900">Report card</h1>
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

  const [boundaries, scores] = await Promise.all([
    prisma.gradeBoundary.findMany({ where: { schoolId } }),
    prisma.score.findMany({
      where: { studentId: student.id, termId: selectedTerm.id },
      include: { subject: true },
      orderBy: { subject: { name: "asc" } },
    }),
  ]);

  const overallAverage = scores.length > 0 ? scores.reduce((sum, s) => sum + s.totalPercent, 0) / scores.length : null;
  const overallGrade = overallAverage !== null ? findGradeForPercent(boundaries, overallAverage) : null;

  return (
    <div className="flex flex-col gap-6">
      {header}

      {terms.length > 1 && (
        <Card>
          <CardBody>
            <TermPicker terms={terms} termId={selectedTerm.id} basePath={`/parent/report-card/${student.id}`} />
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader title={selectedTerm.name} />
        <CardBody className="overflow-x-auto p-0">
          {scores.length === 0 ? (
            <p className="px-5 py-4 text-sm text-slate-500">No scores recorded for this term yet.</p>
          ) : (
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-slate-100 text-slate-500">
                <tr>
                  <th className="px-5 py-2 font-medium">Subject</th>
                  <th className="px-5 py-2 font-medium">Class score</th>
                  <th className="px-5 py-2 font-medium">Exam score</th>
                  <th className="px-5 py-2 font-medium">Total %</th>
                  <th className="px-5 py-2 font-medium">Grade</th>
                  <th className="px-5 py-2 font-medium">Remark</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((score) => (
                  <tr key={score.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-5 py-3 font-medium text-slate-900">{score.subject.name}</td>
                    <td className="px-5 py-3 text-slate-600">{score.scaledClassScore.toFixed(1)}</td>
                    <td className="px-5 py-3 text-slate-600">{score.scaledExamScore.toFixed(1)}</td>
                    <td className="px-5 py-3 text-slate-600">{score.totalPercent.toFixed(1)}%</td>
                    <td className="px-5 py-3">
                      <Badge tone={gradeTone(score.grade)}>{score.grade}</Badge>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{score.remark}</td>
                  </tr>
                ))}
              </tbody>
              {overallAverage !== null && overallGrade && (
                <tfoot>
                  <tr className="border-t border-slate-200 bg-slate-50 font-medium">
                    <td className="px-5 py-3 text-slate-900">Overall average</td>
                    <td className="px-5 py-3"></td>
                    <td className="px-5 py-3"></td>
                    <td className="px-5 py-3 text-slate-900">{overallAverage.toFixed(1)}%</td>
                    <td className="px-5 py-3">
                      <Badge tone={gradeTone(overallGrade.grade)}>{overallGrade.grade}</Badge>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{overallGrade.remark}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
