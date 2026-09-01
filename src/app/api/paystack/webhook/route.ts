import { createHmac } from "crypto";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyTransaction } from "@/lib/paystack";

// 90 days — one school term
const SUBSCRIPTION_DURATION_MS = 90 * 24 * 60 * 60 * 1000;

type PaystackEvent = {
  event: string;
  data: {
    reference: string;
    metadata?: { type?: string };
    authorization?: { authorization_code: string; reusable: boolean };
    customer?: { email: string };
  };
};

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-paystack-signature") ?? "";
  const secret = process.env.PAYSTACK_SECRET_KEY ?? "";

  const expected = createHmac("sha512", secret).update(body).digest("hex");
  if (expected !== signature) {
    return new Response("Unauthorized", { status: 401 });
  }

  let event: PaystackEvent;
  try {
    event = JSON.parse(body) as PaystackEvent;
  } catch {
    return new Response("Bad Request", { status: 400 });
  }

  if (event.event === "charge.success") {
    const type = event.data.metadata?.type;
    if (type === "subscription") {
      await handleSubscriptionPayment(event.data);
    } else {
      await handleFeePayment(event.data.reference);
    }
  }

  return new Response("OK", { status: 200 });
}

async function handleFeePayment(reference: string) {
  const payment = await prisma.payment.findUnique({ where: { paystackRef: reference } });
  if (!payment || payment.status === "success") return;

  const txn = await verifyTransaction(reference);
  if (txn.status !== "success") return;

  const amountNaira = txn.amount / 100;

  await prisma.$transaction(async (tx: typeof prisma) => {
    const updated = await tx.payment.updateMany({
      where: { paystackRef: reference, status: "pending" },
      data: { status: "success" },
    });
    if (updated.count === 0) return;

    await tx.fee.update({
      where: { id: payment.feeId },
      data: { amountPaid: { increment: amountNaira } },
    });
  });
}

async function handleSubscriptionPayment(data: PaystackEvent["data"]) {
  const { reference, authorization, customer } = data;

  const schoolPayment = await prisma.schoolPayment.findUnique({ where: { paystackRef: reference } });
  if (!schoolPayment || schoolPayment.status === "success") return;

  const txn = await verifyTransaction(reference);
  if (txn.status !== "success") return;

  const expiresAt = new Date(Date.now() + SUBSCRIPTION_DURATION_MS);

  // Store the authorization code only if Paystack marks it as reusable
  const authCode =
    authorization?.reusable ? authorization.authorization_code : undefined;
  const customerEmail = customer?.email;

  await prisma.$transaction(async (tx: typeof prisma) => {
    const updated = await tx.schoolPayment.updateMany({
      where: { paystackRef: reference, status: "pending" },
      data: { status: "success" },
    });
    if (updated.count === 0) return;

    await tx.school.update({
      where: { id: schoolPayment.schoolId },
      data: {
        subscriptionPlan: schoolPayment.plan,
        subscriptionStatus: "ACTIVE",
        subscriptionExpiresAt: expiresAt,
        ...(authCode && { paystackAuthCode: authCode }),
        ...(customerEmail && { paystackCustomerEmail: customerEmail }),
      },
    });
  });
}
