import { prisma } from "@/lib/prisma";
import { isSubscriptionInterval, type PaystackChargeData, type PaystackSubscriptionData } from "@/lib/paystack";

function planCodeOf(plan: PaystackChargeData["plan"]): string | undefined {
  if (!plan) return undefined;
  return typeof plan === "string" ? plan || undefined : plan.plan_code;
}

// Called from both the Paystack webhook (charge.success) and the billing page's
// post-checkout callback, so it must be safe to run twice for the same charge.
export async function activateSubscriptionFromCharge(data: PaystackChargeData): Promise<void> {
  if (data.status !== "success") return;

  const schoolId = data.metadata?.schoolId;
  const interval = data.metadata?.interval;
  const customerCode = data.customer.customer_code;

  const school = schoolId
    ? await prisma.school.findUnique({ where: { id: schoolId } })
    : await prisma.school.findFirst({ where: { paystackCustomerCode: customerCode } });
  if (!school) return;

  await prisma.school.update({
    where: { id: school.id },
    data: {
      subscriptionStatus: "ACTIVE",
      subscriptionPlan: "PRO",
      subscriptionInterval: interval && isSubscriptionInterval(interval) ? interval : school.subscriptionInterval,
      paystackCustomerCode: customerCode,
      paystackPlanCode: planCodeOf(data.plan) ?? school.paystackPlanCode,
    },
  });
}

export async function recordSubscriptionCreated(data: PaystackSubscriptionData): Promise<void> {
  const school = await prisma.school.findFirst({ where: { paystackCustomerCode: data.customer.customer_code } });
  if (!school) return;

  await prisma.school.update({
    where: { id: school.id },
    data: {
      subscriptionStatus: "ACTIVE",
      paystackSubscriptionCode: data.subscription_code,
      paystackPlanCode: data.plan.plan_code,
      nextBillingDate: data.next_payment_date ? new Date(data.next_payment_date) : null,
    },
  });
}

export async function suspendSubscriptionForCustomer(customerCode: string): Promise<void> {
  await prisma.school.updateMany({
    where: { paystackCustomerCode: customerCode },
    data: { subscriptionStatus: "SUSPENDED" },
  });
}
