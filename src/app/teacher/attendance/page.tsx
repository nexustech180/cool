import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { ClassPicker } from "@/components/ClassPicker";
import { AttendanceEntryForm } from "./AttendanceEntryForm";

export default async function TeacherAttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string }>;
}) {
  const user = await requireRole("TEACHER");
  const schoolId = user.schoolId!;
  const params = await searchParams;

  const heading = (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Attendance</h1>
      <p className="mt-1 text-sm text-slate-500">Record days present for your class this term.</p>
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

  const [students, existingAttendance] = await Promise.all([
    prisma.student.findMany({ where: { schoolId, classId: selectedClass.id }, orderBy: { fullName: "asc" } }),
    prisma.attendance.findMany({
      where: { termId: activeTerm.id, student: { classId: selectedClass.id, schoolId } },
    }),
  ]);

  const attendanceByStudent = new Map(existingAttendance.map((a) => [a.studentId, a]));
  const studentsForForm = students.map((s) => ({
    id: s.id,
    fullName: s.fullName,
    daysPresent: attendanceByStudent.get(s.id)?.daysPresent ?? null,
  }));

  return (
    <div className="flex flex-col gap-6">
      {heading}

      {formTeacherClasses.length > 1 && (
        <Card>
          <CardBody>
            <ClassPicker classes={formTeacherClasses} classId={selectedClass.id} basePath="/teacher/attendance" />
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader title={selectedClass.name} subtitle={`${activeTerm.name} — ${activeTerm.totalDays} total days`} />
        <CardBody>
          {students.length === 0 ? (
            <p className="text-sm text-slate-500">No students in this class yet.</p>
          ) : (
            <AttendanceEntryForm
              key={selectedClass.id}
              classId={selectedClass.id}
              termId={activeTerm.id}
              totalDays={activeTerm.totalDays}
              students={studentsForForm}
            />
          )}
        </CardBody>
      </Card>
    </div>
  );
}
