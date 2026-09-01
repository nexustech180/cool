"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { type Plan } from "@/lib/plans";
import { initiateSubscriptionPaymentAction, type BillingState } from "./actions";

const initial: BillingState = {};

export function UpgradeForm({ plan }: { plan: Plan }) {
  const [state, formAction, pending] = useActionState(initiateSubscriptionPaymentAction, initial);

  return (
    <form action={formAction} className="flex flex-col gap-3 pt-3 border-t border-slate-100">
      <input type="hidden" name="planId" value={plan.id} />
      <div className="flex flex-col gap-1">
        <label htmlFor={`email-${plan.id}`} className="text-xs font-medium text-slate-700">
          Email address (for receipt)
        </label>
        <input
          id={`email-${plan.id}`}
          type="email"
          name="email"
          required
          placeholder="you@example.com"
          className="max-w-xs rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
        />
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Redirecting to Paystack…" : `Pay ₦${plan.priceNaira.toLocaleString()}`}
      </Button>
    </form>
  );
}
