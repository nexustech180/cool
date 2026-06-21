import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { ClassPicker } from "@/components/ClassPicker";
import { FeeEntryForm } from "./FeeEntryForm";

export default async function TeacherFeesPage({ searchParams }: { searchParams: Promise<{ classId?: string }> }) {
  const user = await requireRole("TEACHER");
  const schoolId = user.schoolId!;
  const params = await searchParams;

  const heading = (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Fees</h1>
      <p className="mt-1 text-sm text-slate-500">Record fee payments for your class this term.</p>
    </div>
  );

  const formTeacherClasses = await prisma.class.findMany({
    where: { schoolId, formTeacherId: user.id },
    orderBy: { name: "asc" },
  });
  if (formTeacherClasses.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        {heading}
        <Card>
          <CardBody>
            <p className="text-sm text-slate-500">You are not the form teacher of any class.</p>
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

  const selectedClass = formTeacherClasses.find((k) => k.id === params.classId) ?? formTeacherClasses[0];

  const [students, existingFees] = await Promise.all([
    prisma.student.findMany({ where: { schoolId, classId: selectedClass.id }, orderBy: { fullName: "asc" } }),
    prisma.fee.findMany({
      where: { termId: activeTerm.id, student: { classId: selectedClass.id, schoolId } },
    }),
  ]);

  const feeByStudent = new Map(existingFees.map((f) => [f.studentId, f]));
  const studentsForForm = students.map((s) => {
    const existing = feeByStudent.get(s.id);
    return {
      id: s.id,
      fullName: s.fullName,
      amountDue: existing?.amountDue ?? null,
      amountPaid: existing?.amountPaid ?? null,
    };
  });

  return (
    <div className="flex flex-col gap-6">
      {heading}

      {formTeacherClasses.length > 1 && (
        <Card>
          <CardBody>
            <ClassPicker classes={formTeacherClasses} classId={selectedClass.id} basePath="/teacher/fees" />
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader title={selectedClass.name} subtitle={activeTerm.name} />
        <CardBody>
          {students.length === 0 ? (
            <p className="text-sm text-slate-500">No students in this class yet.</p>
          ) : (
            <FeeEntryForm
              key={selectedClass.id}
              classId={selectedClass.id}
              termId={activeTerm.id}
              students={studentsForForm}
            />
          )}
        </CardBody>
      </Card>
    </div>
  );
}
