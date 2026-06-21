import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { AddNamedEntityForm } from "@/components/AddNamedEntityForm";
import { ConfirmDeleteButton } from "@/components/ConfirmDeleteButton";
import { addClassAction, assignFormTeacherAction, deleteClassAction } from "./actions";

export default async function SchoolAdminClassesPage() {
  const user = await requireRole("SCHOOL_ADMIN");
  const schoolId = user.schoolId!;

  const [classes, teachers] = await Promise.all([
    prisma.class.findMany({
      where: { schoolId },
      orderBy: { name: "asc" },
      include: { formTeacher: true, _count: { select: { students: true } } },
    }),
    prisma.user.findMany({
      where: { schoolId, role: "TEACHER" },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Classes</h1>
        <p className="mt-1 text-sm text-slate-500">Add classes and assign a form teacher to each.</p>
      </div>

      <Card>
        <CardBody>
          <AddNamedEntityForm action={addClassAction} label="Add class" placeholder="e.g. JSS1A" />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title={`${classes.length} class${classes.length === 1 ? "" : "es"}`} />
        <CardBody className="overflow-x-auto p-0">
          {classes.length === 0 ? (
            <p className="px-5 py-4 text-sm text-slate-500">No classes yet.</p>
          ) : (
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-slate-100 text-slate-500">
                <tr>
                  <th className="px-5 py-2 font-medium">Class</th>
                  <th className="px-5 py-2 font-medium">Students</th>
                  <th className="px-5 py-2 font-medium">Form teacher</th>
                  <th className="px-5 py-2 font-medium">Delete</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((klass) => (
                  <tr key={klass.id} className="border-b border-slate-50 align-top last:border-0">
                    <td className="px-5 py-3 font-medium text-slate-900">{klass.name}</td>
                    <td className="px-5 py-3 text-slate-600">{klass._count.students}</td>
                    <td className="px-5 py-3">
                      <form action={assignFormTeacherAction} className="flex items-center gap-2">
                        <input type="hidden" name="classId" value={klass.id} />
                        <select
                          name="formTeacherId"
                          defaultValue={klass.formTeacherId ?? ""}
                          className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                        >
                          <option value="">— None —</option>
                          {teachers.map((teacher) => (
                            <option key={teacher.id} value={teacher.id}>
                              {teacher.name}
                            </option>
                          ))}
                        </select>
                        <button type="submit" className="text-xs font-medium text-indigo-600 hover:underline">
                          Save
                        </button>
                      </form>
                    </td>
                    <td className="px-5 py-3">
                      <ConfirmDeleteButton
                        action={deleteClassAction}
                        hiddenFields={{ classId: klass.id }}
                        confirmMessage={`Delete ${klass.name}?`}
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
