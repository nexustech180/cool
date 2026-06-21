import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDeleteForm } from "@/components/ConfirmDeleteForm";
import { AddTermForm } from "./AddTermForm";
import { setActiveTermAction, deleteTermAction } from "./actions";

export default async function SchoolAdminTermsPage() {
  const user = await requireRole("SCHOOL_ADMIN");

  const terms = await prisma.term.findMany({
    where: { schoolId: user.schoolId! },
    orderBy: { startDate: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Terms</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage academic terms. Attendance, fees, and report cards are tracked per term.
        </p>
      </div>

      <Card>
        <CardBody>
          <AddTermForm />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title={`${terms.length} term${terms.length === 1 ? "" : "s"}`} />
        <CardBody className="overflow-x-auto p-0">
          {terms.length === 0 ? (
            <p className="px-5 py-4 text-sm text-slate-500">No terms yet.</p>
          ) : (
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-slate-100 text-slate-500">
                <tr>
                  <th className="px-5 py-2 font-medium">Term</th>
                  <th className="px-5 py-2 font-medium">Dates</th>
                  <th className="px-5 py-2 font-medium">Total days</th>
                  <th className="px-5 py-2 font-medium">Status</th>
                  <th className="px-5 py-2 font-medium">Delete</th>
                </tr>
              </thead>
              <tbody>
                {terms.map((term) => (
                  <tr key={term.id} className="border-b border-slate-50 align-top last:border-0">
                    <td className="px-5 py-3 font-medium text-slate-900">{term.name}</td>
                    <td className="px-5 py-3 text-slate-600">
                      {term.startDate.toLocaleDateString()} – {term.endDate.toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3 text-slate-600">{term.totalDays}</td>
                    <td className="px-5 py-3">
                      {term.isActive ? (
                        <Badge tone="green">Active</Badge>
                      ) : (
                        <form action={setActiveTermAction}>
                          <input type="hidden" name="termId" value={term.id} />
                          <button type="submit" className="text-xs font-medium text-indigo-600 hover:underline">
                            Set active
                          </button>
                        </form>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <ConfirmDeleteForm
                        action={deleteTermAction}
                        hiddenFields={{ termId: term.id }}
                        confirmMessage={`Delete ${term.name}? This also removes its scores, attendance, and fee records.`}
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
