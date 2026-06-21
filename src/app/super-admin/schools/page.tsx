import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SUBSCRIPTION_STATUSES } from "@/lib/types";
import { AddSchoolForm } from "./AddSchoolForm";
import { DeleteSchoolForm } from "./DeleteSchoolForm";
import { updateSchoolAction, regeneratePasskeyAction } from "./actions";

const PLANS = ["FREE", "PRO", "ENTERPRISE"];

function statusTone(status: string) {
  if (status === "ACTIVE") return "green" as const;
  if (status === "TRIAL") return "yellow" as const;
  return "red" as const;
}

export default async function SuperAdminSchoolsPage() {
  const schools = await prisma.school.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { users: true, students: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Schools</h1>
        <p className="mt-1 text-sm text-slate-500">Add, edit, and manage every school on the platform.</p>
      </div>

      <AddSchoolForm />

      <Card>
        <CardHeader title={`${schools.length} school${schools.length === 1 ? "" : "s"}`} />
        <CardBody className="overflow-x-auto p-0">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="border-b border-slate-100 text-slate-500">
              <tr>
                <th className="px-5 py-2 font-medium">School</th>
                <th className="px-5 py-2 font-medium">Passkey</th>
                <th className="px-5 py-2 font-medium">Users</th>
                <th className="px-5 py-2 font-medium">Students</th>
                <th className="px-5 py-2 font-medium">Status &amp; plan</th>
                <th className="px-5 py-2 font-medium">Delete</th>
              </tr>
            </thead>
            <tbody>
              {schools.map((school) => (
                <tr key={school.id} className="border-b border-slate-50 align-top last:border-0">
                  <td className="px-5 py-3 font-medium text-slate-900">{school.name}</td>
                  <td className="px-5 py-3">
                    <span className="font-mono text-slate-600">{school.passkey}</span>
                    <form action={regeneratePasskeyAction} className="mt-1">
                      <input type="hidden" name="schoolId" value={school.id} />
                      <button type="submit" className="text-xs font-medium text-indigo-600 hover:underline">
                        Regenerate
                      </button>
                    </form>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{school._count.users}</td>
                  <td className="px-5 py-3 text-slate-600">{school._count.students}</td>
                  <td className="px-5 py-3">
                    <form action={updateSchoolAction} className="flex flex-wrap items-center gap-2">
                      <input type="hidden" name="schoolId" value={school.id} />
                      <select
                        name="subscriptionStatus"
                        defaultValue={school.subscriptionStatus}
                        className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                      >
                        {SUBSCRIPTION_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                      <select
                        name="subscriptionPlan"
                        defaultValue={school.subscriptionPlan}
                        className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                      >
                        {PLANS.map((plan) => (
                          <option key={plan} value={plan}>
                            {plan}
                          </option>
                        ))}
                      </select>
                      <button type="submit" className="text-xs font-medium text-indigo-600 hover:underline">
                        Save
                      </button>
                    </form>
                    <div className="mt-1">
                      <Badge tone={statusTone(school.subscriptionStatus)}>{school.subscriptionStatus}</Badge>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <DeleteSchoolForm schoolId={school.id} schoolName={school.name} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {schools.length === 0 && <p className="px-5 py-4 text-sm text-slate-500">No schools yet.</p>}
        </CardBody>
      </Card>
    </div>
  );
}
