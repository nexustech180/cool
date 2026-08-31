import crypto from "node:crypto";
import { SUBSCRIPTION_INTERVALS, type SubscriptionInterval } from "@/lib/types";

const PAYSTACK_API_BASE = "https://api.paystack.co";

// Ghanaian Cedi. Amounts below must match the currency + amount configured
// on the corresponding Plan in the Paystack dashboard for each interval.
export const SUBSCRIPTION_CURRENCY = "GHS";

export const PRO_PLAN_PRICING: Record<SubscriptionInterval, { amountGHS: number }> = {
  MONTHLY: { amountGHS: 150 },
  QUARTERLY: { amountGHS: 400 },
  ANNUALLY: { amountGHS: 1500 },
};

function envKeyForInterval(interval: SubscriptionInterval): string {
  return `PAYSTACK_PRO_${interval}_PLAN_CODE`;
}

export function planCodeForInterval(interval: SubscriptionInterval): string {
  const key = envKeyForInterval(interval);
  const code = process.env[key];
  if (!code) {
    throw new Error(
      `Missing ${key}. Create a "Pro" Plan in your Paystack dashboard (currency ${SUBSCRIPTION_CURRENCY}, ${interval.toLowerCase()} interval) and set its plan code in this env var.`
    );
  }
  return code;
}

function getSecretKey(): string {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) throw new Error("PAYSTACK_SECRET_KEY is not set.");
  return secretKey;
}

export type PaystackChargeData = {
  status: string;
  reference: string;
  customer: { customer_code: string; email: string };
  plan?: { plan_code: string } | string | null;
  metadata?: { schoolId?: string; interval?: SubscriptionInterval } | null;
};

export type PaystackSubscriptionData = {
  subscription_code: string;
  next_payment_date: string | null;
  customer: { customer_code: string };
  plan: { plan_code: string };
};

export async function initializePaystackTransaction(params: {
  email: string;
  planCode: string;
  callbackUrl: string;
  metadata: Record<string, unknown>;
}): Promise<{ authorization_url: string; access_code: string; reference: string }> {
  const res = await fetch(`${PAYSTACK_API_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: params.email,
      plan: params.planCode,
      currency: SUBSCRIPTION_CURRENCY,
      callback_url: params.callbackUrl,
      metadata: params.metadata,
    }),
  });

  const json = await res.json();
  if (!res.ok || !json.status) {
    throw new Error(json.message ?? "Could not start Paystack checkout.");
  }
  return json.data;
}

export async function verifyPaystackTransaction(reference: string): Promise<PaystackChargeData> {
  const res = await fetch(`${PAYSTACK_API_BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${getSecretKey()}` },
  });

  const json = await res.json();
  if (!res.ok || !json.status) {
    throw new Error(json.message ?? "Could not verify Paystack transaction.");
  }
  return json.data;
}

export function verifyPaystackWebhookSignature(rawBody: string, signature: string | null): boolean {
  if (!signature) return false;
  const hash = crypto.createHmac("sha512", getSecretKey()).update(rawBody).digest("hex");
  const hashBuffer = Buffer.from(hash);
  const signatureBuffer = Buffer.from(signature);
  if (hashBuffer.length !== signatureBuffer.length) return false;
  return crypto.timingSafeEqual(hashBuffer, signatureBuffer);
}

export function isSubscriptionInterval(value: string): value is SubscriptionInterval {
  return (SUBSCRIPTION_INTERVALS as readonly string[]).includes(value);
}
