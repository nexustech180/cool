"use client";

import { useState } from "react";
import { TextField } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { updateWeightageAction } from "./actions";

export function WeightageForm({ initialClassScoreWeight }: { initialClassScoreWeight: number }) {
  const [classScoreWeight, setClassScoreWeight] = useState(initialClassScoreWeight);
  const examWeight = 100 - classScoreWeight;

  return (
    <form action={updateWeightageAction} className="flex flex-wrap items-end gap-3">
      <TextField
        label="Class score weight (%)"
        name="classScoreWeight"
        type="number"
        min={0}
        max={100}
        value={classScoreWeight}
        onChange={(event) => setClassScoreWeight(Number(event.target.value))}
        hint={`Exam score will be weighted at ${examWeight}%`}
      />
      <Button type="submit">Save</Button>
    </form>
  );
}
