"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { initiatePaymentAction, type PaymentState } from "./actions";

const initial: PaymentState = {};

export function PayNowForm({ feeId, balance }: { feeId: string; balance: number }) {
  const [state, formAction, pending] = useActionState(initiatePaymentAction, initial);

  return (
    <form action={formAction} className="flex flex-col gap-3 border-t border-slate-100 pt-4">
      <div>
        <p className="text-sm font-medium text-slate-700">Pay outstanding balance</p>
        <p className="mt-0.5 text-xs text-slate-500">
          You will be redirected to Paystack to pay ₦{balance.toLocaleString()}.
        </p>
      </div>
      <input type="hidden" name="feeId" value={feeId} />
      <div className="flex flex-col gap-1">
        <label htmlFor="pay-email" className="text-xs font-medium text-slate-700">
          Email address (for receipt)
        </label>
        <input
          id="pay-email"
          type="email"
          name="email"
          required
          placeholder="you@example.com"
          className="max-w-xs rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
        />
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Redirecting to Paystack…" : `Pay ₦${balance.toLocaleString()}`}
      </Button>
    </form>
  );
}
