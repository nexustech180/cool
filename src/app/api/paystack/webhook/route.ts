import { createHmac } from "crypto";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyTransaction } from "@/lib/paystack";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-paystack-signature") ?? "";
  const secret = process.env.PAYSTACK_SECRET_KEY ?? "";

  const expected = createHmac("sha512", secret).update(body).digest("hex");
  if (expected !== signature) {
    return new Response("Unauthorized", { status: 401 });
  }

  let event: { event: string; data: { reference: string } };
  try {
    event = JSON.parse(body) as typeof event;
  } catch {
    return new Response("Bad Request", { status: 400 });
  }

  if (event.event === "charge.success") {
    await handleChargeSuccess(event.data.reference);
  }

  return new Response("OK", { status: 200 });
}

async function handleChargeSuccess(reference: string) {
  const payment = await prisma.payment.findUnique({ where: { paystackRef: reference } });
  if (!payment || payment.status === "success") return;

  // Verify with Paystack before recording (belt-and-suspenders)
  const txn = await verifyTransaction(reference);
  if (txn.status !== "success") return;

  const amountNaira = txn.amount / 100;

  // Atomic: mark payment success + increment fee.amountPaid only once
  await prisma.$transaction(async (tx: typeof prisma) => {
    const updated = await tx.payment.updateMany({
      where: { paystackRef: reference, status: "pending" },
      data: { status: "success" },
    });
    if (updated.count === 0) return; // Another webhook already processed this

    await tx.fee.update({
      where: { id: payment.feeId },
      data: { amountPaid: { increment: amountNaira } },
    });
  });
}
