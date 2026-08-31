"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { initializePaystackTransaction, isSubscriptionInterval, planCodeForInterval } from "@/lib/paystack";

export type SubscribeState = { error?: string };

export async function subscribeAction(_prevState: SubscribeState, formData: FormData): Promise<SubscribeState> {
  const user = await requireRole("SCHOOL_ADMIN");
  const email = String(formData.get("email") ?? "").trim();
  const interval = String(formData.get("interval") ?? "");

  if (!email || !email.includes("@")) return { error: "Enter a valid billing email." };
  if (!isSubscriptionInterval(interval)) return { error: "Choose a billing interval." };

  const school = await prisma.school.findUniqueOrThrow({ where: { id: user.schoolId! } });

  let authorizationUrl: string;
  try {
    const planCode = planCodeForInterval(interval);
    const headerList = await headers();
    const origin = headerList.get("origin") ?? `https://${headerList.get("host")}`;

    const data = await initializePaystackTransaction({
      email,
      planCode,
      callbackUrl: `${origin}/school-admin/billing`,
      metadata: { schoolId: school.id, interval },
    });
    authorizationUrl = data.authorization_url;
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not start checkout." };
  }

  await prisma.school.update({ where: { id: school.id }, data: { billingEmail: email } });

  redirect(authorizationUrl);
}
