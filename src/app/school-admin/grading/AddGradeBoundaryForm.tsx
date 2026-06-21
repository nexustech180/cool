"use client";

import { useActionState } from "react";
import { TextField } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { addGradeBoundaryAction } from "./actions";

export function AddGradeBoundaryForm() {
  const [state, formAction, pending] = useActionState(addGradeBoundaryAction, {});

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <TextField label="Min %" name="minPercent" type="number" min={0} max={100} step="0.01" required className="w-24" />
      <TextField label="Max %" name="maxPercent" type="number" min={0} max={100} step="0.01" required className="w-24" />
      <TextField label="Grade" name="grade" placeholder="e.g. A1" required className="w-24" />
      <TextField label="Remark" name="remark" placeholder="e.g. Excellent" required />
      <Button type="submit" disabled={pending}>
        Add boundary
      </Button>
      {state.error && <p className="w-full text-xs text-red-600">{state.error}</p>}
    </form>
  );
}
