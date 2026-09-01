import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { chargeAuthorization } from "@/lib/paystack";
import { getPlan } from "@/lib/plans";

// Called daily by Vercel Cron. Charges schools whose subscriptions expire within 7 days.
export async function GET(req: NextRequest) {
  // Protect the endpoint: Vercel Cron sets Authorization: Bearer <CRON_SECRET>
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.get("authorization") ?? "";
    if (auth !== `Bearer ${cronSecret}`) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  // Find ACTIVE schools with a stored auth code that expire within 7 days
  const schools = await prisma.school.findMany({
    where: {
      subscriptionStatus: "ACTIVE",
      subscriptionExpiresAt: { lte: sevenDaysFromNow },
      paystackAuthCode: { not: null },
      paystackCustomerEmail: { not: null },
    },
  });

  const results: { schoolId: string; status: string; error?: string }[] = [];

  for (const school of schools) {
    const plan = getPlan(school.subscriptionPlan);
    if (plan.priceNaira <= 0) {
      results.push({ schoolId: school.id, status: "skipped_free" });
      continue;
    }

    const reference = `RENEW${Date.now()}${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    try {
      // Create the renewal record first
      await prisma.schoolPayment.create({
        data: {
          paystackRef: reference,
          amount: plan.priceNaira,
          plan: plan.id,
          status: "pending",
          schoolId: school.id,
        },
      });

      await chargeAuthorization({
        authorizationCode: school.paystackAuthCode!,
        email: school.paystackCustomerEmail!,
        amountNaira: plan.priceNaira,
        reference,
        metadata: { type: "subscription", planId: plan.id, schoolId: school.id },
      });

      results.push({ schoolId: school.id, status: "charged" });
    } catch (err) {
      await prisma.schoolPayment
        .update({ where: { paystackRef: reference }, data: { status: "failed" } })
        .catch(() => {});
      results.push({ schoolId: school.id, status: "failed", error: String(err) });
    }
  }

  return Response.json({ processed: results.length, results });
}
