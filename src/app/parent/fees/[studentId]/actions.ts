"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { initializeTransaction } from "@/lib/paystack";

export type PaymentState = { error?: string };

export async function initiatePaymentAction(
  _prevState: PaymentState,
  formData: FormData
): Promise<PaymentState> {
  const user = await requireRole("PARENT");
  const feeId = String(formData.get("feeId") ?? "");
  const email = String(formData.get("email") ?? "").trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Please enter a valid email address." };
  }

  const fee = await prisma.fee.findFirst({
    where: { id: feeId, student: { schoolId: user.schoolId!, parentId: user.id } },
    include: { student: true },
  });
  if (!fee) return { error: "Fee record not found." };

  const balance = fee.amountDue - fee.amountPaid;
  if (balance <= 0) return { error: "No outstanding balance to pay." };

  const reference = `SH${Date.now()}${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const proto = headersList.get("x-forwarded-proto") ?? "http";
  const callbackUrl = `${proto}://${host}/parent/fees/${fee.student.id}?ref=${reference}`;

  await prisma.payment.create({
    data: {
      paystackRef: reference,
      amount: balance,
      status: "pending",
      feeId: fee.id,
      studentId: fee.studentId,
    },
  });

  let authUrl: string;
  try {
    const result = await initializeTransaction({
      email,
      amountNaira: balance,
      reference,
      callbackUrl,
      metadata: { feeId: fee.id, studentId: fee.studentId },
    });
    authUrl = result.authorization_url;
  } catch {
    await prisma.payment.delete({ where: { paystackRef: reference } }).catch(() => {});
    return { error: "Could not initiate payment. Please try again." };
  }

  redirect(authUrl);
  // redirect() throws — satisfies TypeScript's return analysis when types are unavailable
  return {};
}
