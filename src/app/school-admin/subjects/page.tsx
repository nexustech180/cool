import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { AddNamedEntityForm } from "@/components/AddNamedEntityForm";
import { ConfirmDeleteForm } from "@/components/ConfirmDeleteForm";
import { addSubjectAction, deleteSubjectAction } from "./actions";

export default async function SchoolAdminSubjectsPage() {
  const user = await requireRole("SCHOOL_ADMIN");

  const subjects = await prisma.subject.findMany({
    where: { schoolId: user.schoolId! },
    orderBy: { name: "asc" },
    include: { _count: { select: { teacherAssignments: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Subjects</h1>
        <p className="mt-1 text-sm text-slate-500">Add the subjects taught at your school.</p>
      </div>

      <Card>
        <CardBody>
          <AddNamedEntityForm action={addSubjectAction} label="Add subject" placeholder="e.g. Mathematics" />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title={`${subjects.length} subject${subjects.length === 1 ? "" : "s"}`} />
        <CardBody className="overflow-x-auto p-0">
          {subjects.length === 0 ? (
            <p className="px-5 py-4 text-sm text-slate-500">No subjects yet.</p>
          ) : (
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="border-b border-slate-100 text-slate-500">
                <tr>
                  <th className="px-5 py-2 font-medium">Subject</th>
                  <th className="px-5 py-2 font-medium">Teacher assignments</th>
                  <th className="px-5 py-2 font-medium">Delete</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((subject) => (
                  <tr key={subject.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-5 py-3 font-medium text-slate-900">{subject.name}</td>
                    <td className="px-5 py-3 text-slate-600">{subject._count.teacherAssignments}</td>
                    <td className="px-5 py-3">
                      <ConfirmDeleteForm
                        action={deleteSubjectAction}
                        hiddenFields={{ subjectId: subject.id }}
                        confirmMessage={`Delete ${subject.name}? This also removes its teacher assignments and recorded scores.`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
