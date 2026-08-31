"use client";

import { useActionState } from "react";
import { TextField } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { subscriptionIntervalLabel, SUBSCRIPTION_INTERVALS, type SubscriptionInterval } from "@/lib/types";
import { subscribeAction } from "./actions";

export function BillingForm({
  defaultEmail,
  pricing,
}: {
  defaultEmail: string;
  pricing: Record<SubscriptionInterval, number>;
}) {
  const [state, formAction, pending] = useActionState(subscribeAction, {});

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <TextField
        label="Billing email"
        name="email"
        type="email"
        defaultValue={defaultEmail}
        placeholder="school-admin@example.com"
        hint="Paystack sends payment receipts and renewal invoices to this address."
        required
      />

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-slate-700">Billing interval</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {SUBSCRIPTION_INTERVALS.map((interval, index) => (
            <label
              key={interval}
              className="flex cursor-pointer flex-col gap-1 rounded-lg border border-slate-200 p-4 text-sm has-[:checked]:border-indigo-500 has-[:checked]:ring-1 has-[:checked]:ring-indigo-500"
            >
              <span className="flex items-center gap-2 font-medium text-slate-900">
                <input type="radio" name="interval" value={interval} defaultChecked={index === 0} required />
                {subscriptionIntervalLabel(interval)}
              </span>
              <span className="text-slate-600">
                <span className="text-lg font-bold text-slate-900">₵{pricing[interval].toLocaleString()}</span>{" "}
                {interval === "MONTHLY" ? "/month" : interval === "QUARTERLY" ? "/quarter" : "/year"}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Redirecting to Paystack…" : "Subscribe with Paystack"}
      </Button>
      {state.error && <p className="text-xs text-red-600">{state.error}</p>}
    </form>
  );
}
