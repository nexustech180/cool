import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDeleteForm } from "@/components/ConfirmDeleteForm";
import { ConfirmDeleteButton } from "@/components/ConfirmDeleteButton";
import { AddTeacherForm } from "./AddTeacherForm";
import { AddAssignmentForm } from "./AddAssignmentForm";
import { removeStaffAction, deleteAssignmentAction } from "./actions";

export default async function SchoolAdminStaffPage() {
  const user = await requireRole("SCHOOL_ADMIN");
  const schoolId = user.schoolId!;

  const [staff, classes, subjects, assignments] = await Promise.all([
    prisma.user.findMany({
      where: { schoolId, role: { in: ["SCHOOL_ADMIN", "TEACHER"] } },
      orderBy: [{ role: "asc" }, { name: "asc" }],
      include: { formTeacherOfClasses: true },
    }),
    prisma.class.findMany({ where: { schoolId }, orderBy: { name: "asc" } }),
    prisma.subject.findMany({ where: { schoolId }, orderBy: { name: "asc" } }),
    prisma.teacherAssignment.findMany({
      where: { schoolId },
      orderBy: [{ class: { name: "asc" } }, { subject: { name: "asc" } }],
      include: { class: true, subject: true, teacher: true },
    }),
  ]);
  const teachers = staff.filter((member) => member.role === "TEACHER");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Staff</h1>
        <p className="mt-1 text-sm text-slate-500">Add teachers and assign them to classes and subjects.</p>
      </div>

      <AddTeacherForm />

      <Card>
        <CardHeader title={`${staff.length} staff member${staff.length === 1 ? "" : "s"}`} />
        <CardBody className="overflow-x-auto p-0">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-slate-100 text-slate-500">
              <tr>
                <th className="px-5 py-2 font-medium">Name</th>
                <th className="px-5 py-2 font-medium">Phone</th>
                <th className="px-5 py-2 font-medium">Role</th>
                <th className="px-5 py-2 font-medium">Form teacher of</th>
                <th className="px-5 py-2 font-medium">Remove</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((member) => (
                <tr key={member.id} className="border-b border-slate-50 align-top last:border-0">
                  <td className="px-5 py-3 font-medium text-slate-900">
                    {member.name}
                    {member.mustChangePassword && (
                      <span className="ml-2">
                        <Badge tone="yellow">Pending first login</Badge>
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-slate-600">{member.phone}</td>
                  <td className="px-5 py-3">
                    <Badge tone={member.role === "SCHOOL_ADMIN" ? "indigo" : "slate"}>
                      {member.role === "SCHOOL_ADMIN" ? "School Admin" : "Teacher"}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-slate-600">
                    {member.formTeacherOfClasses.map((klass) => klass.name).join(", ") || "—"}
                  </td>
                  <td className="px-5 py-3">
                    {member.role === "TEACHER" && (
                      <ConfirmDeleteButton
                        action={removeStaffAction}
                        hiddenFields={{ userId: member.id }}
                        confirmMessage={`Remove ${member.name} from your school?`}
                        label="Remove"
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Subject assignments" subtitle="Which teacher teaches which subject, in which class." />
        <CardBody className="flex flex-col gap-4">
          <AddAssignmentForm classes={classes} subjects={subjects} teachers={teachers} />
        </CardBody>
        <CardBody className="overflow-x-auto border-t border-slate-100 p-0">
          {assignments.length === 0 ? (
            <p className="px-5 py-4 text-sm text-slate-500">No assignments yet.</p>
          ) : (
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="border-b border-slate-100 text-slate-500">
                <tr>
                  <th className="px-5 py-2 font-medium">Class</th>
                  <th className="px-5 py-2 font-medium">Subject</th>
                  <th className="px-5 py-2 font-medium">Teacher</th>
                  <th className="px-5 py-2 font-medium">Delete</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((assignment) => (
                  <tr key={assignment.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-5 py-3 font-medium text-slate-900">{assignment.class.name}</td>
                    <td className="px-5 py-3 text-slate-600">{assignment.subject.name}</td>
                    <td className="px-5 py-3 text-slate-600">{assignment.teacher.name}</td>
                    <td className="px-5 py-3">
                      <ConfirmDeleteForm
                        action={deleteAssignmentAction}
                        hiddenFields={{ assignmentId: assignment.id }}
                        confirmMessage={`Remove this assignment?`}
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
