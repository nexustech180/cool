import type { NextRequest } from "next/server";
import { verifyPaystackWebhookSignature } from "@/lib/paystack";
import { activateSubscriptionFromCharge, recordSubscriptionCreated, suspendSubscriptionForCustomer } from "@/lib/subscription";

// Paystack webhook — configure this URL (https://<your-domain>/api/webhooks/paystack)
// in the Paystack dashboard so subscription renewals keep School.subscriptionStatus in sync
// even when the parent/school-admin isn't present for the charge (e.g. auto-renewal).
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  if (!verifyPaystackWebhookSignature(rawBody, signature)) {
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody);

  switch (event.event) {
    case "charge.success":
      await activateSubscriptionFromCharge(event.data);
      break;
    case "subscription.create":
      await recordSubscriptionCreated(event.data);
      break;
    case "invoice.payment_failed":
    case "subscription.disable":
    case "subscription.not_renew":
      await suspendSubscriptionForCustomer(event.data.customer.customer_code);
      break;
    default:
      break;
  }

  return Response.json({ received: true });
}
