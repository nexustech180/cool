"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { initializeTransaction } from "@/lib/paystack";
import { getPlan, type PlanId } from "@/lib/plans";

export type BillingState = { error?: string };

export async function initiateSubscriptionPaymentAction(
  _prevState: BillingState,
  formData: FormData
): Promise<BillingState> {
  const user = await requireRole("SCHOOL_ADMIN");
  const schoolId = user.schoolId!;
  const planId = String(formData.get("planId") ?? "") as PlanId;
  const email = String(formData.get("email") ?? "").trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Please enter a valid email address." };
  }

  const plan = getPlan(planId);
  if (!plan || plan.priceNaira <= 0) {
    return { error: "Invalid plan selected." };
  }

  const school = await prisma.school.findUnique({ where: { id: schoolId } });
  if (!school) return { error: "School not found." };

  const reference = `SUB${Date.now()}${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const proto = headersList.get("x-forwarded-proto") ?? "http";
  const callbackUrl = `${proto}://${host}/school-admin/billing?ref=${reference}`;

  await prisma.schoolPayment.create({
    data: {
      paystackRef: reference,
      amount: plan.priceNaira,
      plan: plan.id,
      status: "pending",
      schoolId,
    },
  });

  let authUrl: string;
  try {
    const result = await initializeTransaction({
      email,
      amountNaira: plan.priceNaira,
      reference,
      callbackUrl,
      metadata: { type: "subscription", planId: plan.id, schoolId },
    });
    authUrl = result.authorization_url;
  } catch {
    await prisma.schoolPayment.delete({ where: { paystackRef: reference } }).catch(() => {});
    return { error: "Could not initiate payment. Please try again." };
  }

  redirect(authUrl);
  return {};
}
