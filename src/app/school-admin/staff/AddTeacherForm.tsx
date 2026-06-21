"use client";

import { useActionState, useState } from "react";
import { addTeacherAction, type AddTeacherState } from "./actions";
import { TextField } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

const initialState: AddTeacherState = {};

export function AddTeacherForm() {
  const [state, formAction, pending] = useActionState(addTeacherAction, initialState);
  const [open, setOpen] = useState(false);

  if (state.success) {
    return (
      <div className="flex flex-wrap items-center gap-3 rounded-md bg-indigo-50 px-4 py-3">
        <p className="text-sm text-indigo-900">
          <span className="font-semibold">{state.success.name}</span> added. Temporary password:{" "}
          <span className="font-mono font-bold tracking-widest">{state.success.tempPassword}</span> — they
          must change it on first login.
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
        + Add teacher
      </Button>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-md border border-slate-200 bg-white p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Teacher name" name="name" required />
        <TextField label="Phone number" name="phone" type="tel" required />
      </div>

      {state.error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Adding..." : "Add teacher"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
