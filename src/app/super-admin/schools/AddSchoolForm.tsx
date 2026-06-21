"use client";

import { useActionState, useState } from "react";
import { addSchoolAction, type AddSchoolState } from "./actions";
import { TextField } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

const initialState: AddSchoolState = {};

export function AddSchoolForm() {
  const [state, formAction, pending] = useActionState(addSchoolAction, initialState);
  const [open, setOpen] = useState(false);

  if (state.success) {
    return (
      <div className="flex flex-wrap items-center gap-3 rounded-md bg-indigo-50 px-4 py-3">
        <p className="text-sm text-indigo-900">
          <span className="font-semibold">{state.success.schoolName}</span> created. Passkey:{" "}
          <span className="font-mono font-bold tracking-widest">{state.success.passkey}</span>
        </p>
        <Button variant="secondary" type="button" onClick={() => window.location.reload()}>
          Add another
        </Button>
      </div>
    );
  }

  if (!open) {
    return (
      <Button type="button" onClick={() => setOpen(true)} className="self-start">
        + Add school
      </Button>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-md border border-slate-200 bg-white p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="School name" name="schoolName" required />
        <TextField label="Admin name" name="adminName" required />
        <TextField label="Admin phone" name="adminPhone" type="tel" required />
        <TextField label="Admin password" name="password" type="password" minLength={6} required />
      </div>

      {state.error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Creating..." : "Create school"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
