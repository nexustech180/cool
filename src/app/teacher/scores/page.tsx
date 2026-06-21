import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { ScorePicker } from "./ScorePicker";
import { ScoreEntryForm } from "./ScoreEntryForm";

export default async function TeacherScoresPage({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string; subjectId?: string }>;
}) {
  const user = await requireRole("TEACHER");
  const schoolId = user.schoolId!;
  const params = await searchParams;

  const heading = (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Scores</h1>
      <p className="mt-1 text-sm text-slate-500">Enter class and exam scores for your subjects.</p>
    </div>
  );

  const assignments = await prisma.teacherAssignment.findMany({
    where: { schoolId, teacherId: user.id },
    orderBy: [{ class: { name: "asc" } }, { subject: { name: "asc" } }],
    include: { class: true, subject: true },
  });

  if (assignments.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        {heading}
        <Card>
          <CardBody>
            <p className="text-sm text-slate-500">You have not been assigned to teach any subject yet.</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  const activeTerm = await prisma.term.findFirst({ where: { schoolId, isActive: true } });
  if (!activeTerm) {
    return (
      <div className="flex flex-col gap-6">
        {heading}
        <Card>
          <CardBody>
            <p className="text-sm text-slate-500">No active term is set. Ask your School Admin to set one.</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  const selected =
    assignments.find((a) => a.classId === params.classId && a.subjectId === params.subjectId) ?? assignments[0];

  const [weightage, boundaries, students, existingScores] = await Promise.all([
    prisma.weightageSetting.findUnique({ where: { schoolId } }),
    prisma.gradeBoundary.findMany({ where: { schoolId } }),
    prisma.student.findMany({ where: { schoolId, classId: selected.classId }, orderBy: { fullName: "asc" } }),
    prisma.score.findMany({
      where: { subjectId: selected.subjectId, termId: activeTerm.id, student: { classId: selected.classId, schoolId } },
    }),
  ]);

  const scoreByStudent = new Map(existingScores.map((s) => [s.studentId, s]));
  const studentsForForm = students.map((s) => {
    const existing = scoreByStudent.get(s.id);
    return {
      id: s.id,
      fullName: s.fullName,
      classScoreRaw: existing?.classScoreRaw ?? null,
      examScoreRaw: existing?.examScoreRaw ?? null,
    };
  });
  const initialClassScoreMax = existingScores[0]?.classScoreMax ?? 100;
  const initialExamScoreMax = existingScores[0]?.examScoreMax ?? 100;

  return (
    <div className="flex flex-col gap-6">
      {heading}

      <Card>
        <CardBody>
          <ScorePicker
            assignments={assignments.map((a) => ({
              classId: a.classId,
              className: a.class.name,
              subjectId: a.subjectId,
              subjectName: a.subject.name,
            }))}
            classId={selected.classId}
            subjectId={selected.subjectId}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title={`${selected.class.name} — ${selected.subject.name}`} subtitle={activeTerm.name} />
        <CardBody>
          {students.length === 0 ? (
            <p className="text-sm text-slate-500">No students in this class yet.</p>
          ) : (
            <ScoreEntryForm
              key={`${selected.classId}-${selected.subjectId}`}
              classId={selected.classId}
              subjectId={selected.subjectId}
              termId={activeTerm.id}
              students={studentsForForm}
              classScoreWeight={weightage?.classScoreWeight ?? 40}
              boundaries={boundaries}
              initialClassScoreMax={initialClassScoreMax}
              initialExamScoreMax={initialExamScoreMax}
            />
          )}
        </CardBody>
      </Card>
    </div>
  );
}
