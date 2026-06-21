"use client";

import { useActionState } from "react";
import { TextField } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { addTermAction } from "./actions";

export function AddTermForm() {
  const [state, formAction, pending] = useActionState(addTermAction, {});

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <TextField label="Term name" name="name" placeholder="e.g. First Term 2025/2026" required />
      <TextField label="Start date" name="startDate" type="date" required />
      <TextField label="End date" name="endDate" type="date" required />
      <TextField label="Total days" name="totalDays" type="number" min={1} placeholder="e.g. 60" required />
      <Button type="submit" disabled={pending}>
        Add term
      </Button>
      {state.error && <p className="w-full text-xs text-red-600">{state.error}</p>}
    </form>
  );
}
