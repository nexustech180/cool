import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { subscriptionIntervalLabel, type SubscriptionInterval } from "@/lib/types";
import { PRO_PLAN_PRICING, verifyPaystackTransaction } from "@/lib/paystack";
import { activateSubscriptionFromCharge } from "@/lib/subscription";
import { BillingForm } from "./BillingForm";

function statusTone(status: string) {
  if (status === "ACTIVE") return "green" as const;
  if (status === "TRIAL") return "yellow" as const;
  return "red" as const;
}

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string; trxref?: string; paystack?: string }>;
}) {
  const user = await requireRole("SCHOOL_ADMIN");
  const params = await searchParams;
  const reference = params.reference ?? params.trxref;

  if (reference) {
    let outcome: "success" | "failed" = "failed";
    try {
      const data = await verifyPaystackTransaction(reference);
      if (data.status === "success") {
        await activateSubscriptionFromCharge(data);
        outcome = "success";
      }
    } catch {
      outcome = "failed";
    }
    redirect(`/school-admin/billing?paystack=${outcome}`);
  }

  const school = await prisma.school.findUniqueOrThrow({ where: { id: user.schoolId! } });
  const isPaidActive = school.subscriptionPlan === "PRO" && school.subscriptionStatus === "ACTIVE";

  const pricing = {
    MONTHLY: PRO_PLAN_PRICING.MONTHLY.amountGHS,
    QUARTERLY: PRO_PLAN_PRICING.QUARTERLY.amountGHS,
    ANNUALLY: PRO_PLAN_PRICING.ANNUALLY.amountGHS,
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Billing</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your school&apos;s subscription and payments.</p>
      </div>

      {params.paystack === "success" && (
        <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          Payment received — your subscription is now active.
        </div>
      )}
      {params.paystack === "failed" && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          We couldn&apos;t confirm that payment. If you were charged, it will still be reconciled shortly — contact
          support if your plan doesn&apos;t update.
        </div>
      )}

      <Card>
        <CardHeader title="Current plan" />
        <CardBody>
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone="indigo">{school.subscriptionPlan}</Badge>
            <Badge tone={statusTone(school.subscriptionStatus)}>{school.subscriptionStatus}</Badge>
            {school.subscriptionInterval && (
              <span className="text-sm text-slate-500">
                {subscriptionIntervalLabel(school.subscriptionInterval as SubscriptionInterval)}
              </span>
            )}
          </div>
          {school.nextBillingDate && (
            <p className="mt-2 text-sm text-slate-500">
              Next payment: {new Date(school.nextBillingDate).toLocaleDateString()}
            </p>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title={isPaidActive ? "Change plan" : "Upgrade to Pro"}
          subtitle={
            isPaidActive
              ? "Subscribing again will start a new Paystack subscription for the selected interval."
              : "Unlimited classes and students, attendance & fee tracking, priority support."
          }
        />
        <CardBody>
          <BillingForm defaultEmail={school.billingEmail ?? ""} pricing={pricing} />
        </CardBody>
      </Card>

      <p className="text-sm text-slate-500">
        Need multiple campuses or a custom plan? Enterprise pricing is available on request — contact your account
        manager.
      </p>
    </div>
  );
}
