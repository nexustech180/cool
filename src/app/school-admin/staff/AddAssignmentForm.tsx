"use client";

import { useActionState } from "react";
import { SelectField } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { addAssignmentAction } from "./actions";

export function AddAssignmentForm({
  classes,
  subjects,
  teachers,
}: {
  classes: { id: string; name: string }[];
  subjects: { id: string; name: string }[];
  teachers: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(addAssignmentAction, {});

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <SelectField label="Class" name="classId" required defaultValue="">
        <option value="" disabled>
          Select a class
        </option>
        {classes.map((klass) => (
          <option key={klass.id} value={klass.id}>
            {klass.name}
          </option>
        ))}
      </SelectField>
      <SelectField label="Subject" name="subjectId" required defaultValue="">
        <option value="" disabled>
          Select a subject
        </option>
        {subjects.map((subject) => (
          <option key={subject.id} value={subject.id}>
            {subject.name}
          </option>
        ))}
      </SelectField>
      <SelectField label="Teacher" name="teacherId" required defaultValue="">
        <option value="" disabled>
          Select a teacher
        </option>
        {teachers.map((teacher) => (
          <option key={teacher.id} value={teacher.id}>
            {teacher.name}
          </option>
        ))}
      </SelectField>
      <Button type="submit" disabled={pending}>
        Assign
      </Button>
      {state.error && <p className="w-full text-xs text-red-600">{state.error}</p>}
    </form>
  );
}
