"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";

type State = { error?: string };

export function AddNamedEntityForm({
  action,
  label,
  placeholder,
}: {
  action: (prevState: State, formData: FormData) => Promise<State>;
  label: string;
  placeholder: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="flex items-start gap-2">
      <div className="flex-1">
        <input
          name="name"
          placeholder={placeholder}
          required
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        {state.error && <p className="mt-1 text-xs text-red-600">{state.error}</p>}
      </div>
      <Button type="submit" disabled={pending}>
        {label}
      </Button>
    </form>
  );
}
