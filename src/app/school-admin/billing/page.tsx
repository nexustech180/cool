import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PLANS, getPlan } from "@/lib/plans";
import { UpgradeForm } from "./UpgradeForm";

function statusTone(status: string) {
  if (status === "ACTIVE") return "green" as const;
  if (status === "TRIAL") return "yellow" as const;
  return "red" as const;
}

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const user = await requireRole("SCHOOL_ADMIN");
  const schoolId = user.schoolId!;

  const { ref } = await searchParams;

  const school = await prisma.school.findUniqueOrThrow({ where: { id: schoolId } });

  let paymentBanner: "success" | "pending" | null = null;
  let paidPlan = "";
  if (ref) {
    const sp = await prisma.schoolPayment.findUnique({ where: { paystackRef: ref } });
    if (sp) {
      paymentBanner = sp.status === "success" ? "success" : "pending";
      paidPlan = sp.plan;
    }
  }

  const currentPlan = getPlan(school.subscriptionPlan);

  // Recent payment history
  const recentPayments = await prisma.schoolPayment.findMany({
    where: { schoolId, status: "success" },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Billing</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your SchoolHub subscription.</p>
      </div>

      {paymentBanner === "success" && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          Payment successful! Your subscription has been upgraded to <strong>{paidPlan}</strong>.
        </div>
      )}
      {paymentBanner === "pending" && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Payment is being processed. Your subscription will update once confirmed.
        </div>
      )}

      {/* Current plan */}
      <Card>
        <CardHeader title="Current subscription" />
        <CardBody>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-lg font-semibold text-slate-900">{currentPlan.label}</span>
            <Badge tone={statusTone(school.subscriptionStatus)}>{school.subscriptionStatus}</Badge>
            {school.subscriptionStatus === "TRIAL" && (
              <span className="text-sm text-slate-500">Trial — upgrade to keep your data.</span>
            )}
            {school.subscriptionStatus === "SUSPENDED" && (
              <span className="text-sm text-red-600">Suspended — pay to reactivate.</span>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Plan cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {PLANS.map((plan) => {
          const isCurrent =
            plan.id === school.subscriptionPlan && school.subscriptionStatus === "ACTIVE";
          const isFree = plan.priceNaira === 0;

          return (
            <div
              key={plan.id}
              className={`flex flex-col rounded-lg border p-5 ${
                isCurrent
                  ? "border-indigo-300 bg-indigo-50"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-900">{plan.label}</p>
                {isCurrent && <Badge tone="green">Current</Badge>}
              </div>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {isFree ? "Free" : `₦${plan.priceNaira.toLocaleString()}`}
                {!isFree && <span className="text-sm font-normal text-slate-500">/term</span>}
              </p>
              <ul className="mt-3 flex flex-col gap-1.5 text-sm text-slate-600 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-1.5">
                    <span className="mt-0.5 text-indigo-500">✓</span> {f}
                  </li>
                ))}
              </ul>
              {!isCurrent && !isFree && (
                <div className="mt-4">
                  <UpgradeForm plan={plan} />
                </div>
              )}
              {isCurrent && (
                <p className="mt-4 text-xs text-indigo-600 font-medium">Active plan</p>
              )}
              {!isCurrent && isFree && (
                <p className="mt-4 text-xs text-slate-400">No payment required</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Payment history */}
      {recentPayments.length > 0 && (
        <Card>
          <CardHeader title="Payment history" />
          <CardBody className="overflow-x-auto p-0">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 text-slate-500">
                <tr>
                  <th className="px-5 py-2 font-medium">Date</th>
                  <th className="px-5 py-2 font-medium">Plan</th>
                  <th className="px-5 py-2 font-medium">Amount</th>
                  <th className="px-5 py-2 font-medium">Reference</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map((p) => (
                  <tr key={p.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-5 py-3 text-slate-600">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3 font-medium text-slate-900">{p.plan}</td>
                    <td className="px-5 py-3 text-slate-600">₦{p.amount.toLocaleString()}</td>
                    <td className="px-5 py-3 font-mono text-xs text-slate-400">{p.paystackRef}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
