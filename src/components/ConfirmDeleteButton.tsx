"use client";

import { useActionState } from "react";

type State = { error?: string };

export function ConfirmDeleteButton({
  action,
  hiddenFields,
  confirmMessage,
  label = "Delete",
}: {
  action: (prevState: State, formData: FormData) => Promise<State>;
  hiddenFields: Record<string, string>;
  confirmMessage: string;
  label?: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!confirm(confirmMessage)) event.preventDefault();
      }}
    >
      {Object.entries(hiddenFields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <button type="submit" disabled={pending} className="text-xs font-medium text-red-600 hover:underline">
        {label}
      </button>
      {state.error && <p className="mt-1 max-w-[180px] text-xs text-red-600">{state.error}</p>}
    </form>
  );
}
