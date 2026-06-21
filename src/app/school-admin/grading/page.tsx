import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { ConfirmDeleteForm } from "@/components/ConfirmDeleteForm";
import { WeightageForm } from "./WeightageForm";
import { AddGradeBoundaryForm } from "./AddGradeBoundaryForm";
import { updateGradeBoundaryAction, deleteGradeBoundaryAction } from "./actions";

export default async function SchoolAdminGradingPage() {
  const user = await requireRole("SCHOOL_ADMIN");
  const schoolId = user.schoolId!;

  const [weightage, boundaries] = await Promise.all([
    prisma.weightageSetting.findUnique({ where: { schoolId } }),
    prisma.gradeBoundary.findMany({ where: { schoolId }, orderBy: { minPercent: "desc" } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Grading</h1>
        <p className="mt-1 text-sm text-slate-500">
          Set how much class score vs. exam score counts, and how percentages map to grades.
        </p>
      </div>

      <Card>
        <CardHeader title="Score weightage" subtitle="Applies to every subject and class." />
        <CardBody>
          <WeightageForm initialClassScoreWeight={weightage?.classScoreWeight ?? 40} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Add grade boundary" />
        <CardBody>
          <AddGradeBoundaryForm />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title={`${boundaries.length} grade boundar${boundaries.length === 1 ? "y" : "ies"}`} />
        <CardBody className="overflow-x-auto p-0">
          {boundaries.length === 0 ? (
            <p className="px-5 py-4 text-sm text-slate-500">No grade boundaries yet.</p>
          ) : (
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-slate-100 text-slate-500">
                <tr>
                  <th className="px-5 py-2 font-medium">Min %</th>
                  <th className="px-5 py-2 font-medium">Max %</th>
                  <th className="px-5 py-2 font-medium">Grade</th>
                  <th className="px-5 py-2 font-medium">Remark</th>
                  <th className="px-5 py-2 font-medium"></th>
                  <th className="px-5 py-2 font-medium">Delete</th>
                </tr>
              </thead>
              <tbody>
                {boundaries.map((boundary) => (
                  <tr key={boundary.id} className="border-b border-slate-50 align-top last:border-0">
                    <td colSpan={5} className="px-5 py-3">
                      <form action={updateGradeBoundaryAction} className="flex flex-wrap items-center gap-2">
                        <input type="hidden" name="boundaryId" value={boundary.id} />
                        <input
                          name="minPercent"
                          type="number"
                          min={0}
                          max={100}
                          step="0.01"
                          defaultValue={boundary.minPercent}
                          className="w-20 rounded-md border border-slate-300 px-2 py-1 text-xs"
                        />
                        <input
                          name="maxPercent"
                          type="number"
                          min={0}
                          max={100}
                          step="0.01"
                          defaultValue={boundary.maxPercent}
                          className="w-20 rounded-md border border-slate-300 px-2 py-1 text-xs"
                        />
                        <input
                          name="grade"
                          defaultValue={boundary.grade}
                          className="w-20 rounded-md border border-slate-300 px-2 py-1 text-xs"
                        />
                        <input
                          name="remark"
                          defaultValue={boundary.remark}
                          className="flex-1 min-w-[140px] rounded-md border border-slate-300 px-2 py-1 text-xs"
                        />
                        <button type="submit" className="text-xs font-medium text-indigo-600 hover:underline">
                          Save
                        </button>
                      </form>
                    </td>
                    <td className="px-5 py-3">
                      <ConfirmDeleteForm
                        action={deleteGradeBoundaryAction}
                        hiddenFields={{ boundaryId: boundary.id }}
                        confirmMessage={`Delete the ${boundary.grade} grade boundary?`}
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
