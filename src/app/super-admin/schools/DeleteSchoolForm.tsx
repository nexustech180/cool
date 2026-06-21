"use client";

import { deleteSchoolAction } from "./actions";

export function DeleteSchoolForm({ schoolId, schoolName }: { schoolId: string; schoolName: string }) {
  return (
    <form
      action={deleteSchoolAction}
      onSubmit={(event) => {
        if (
          !confirm(
            `Delete ${schoolName}? This permanently removes all its classes, staff, students, and records.`
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="schoolId" value={schoolId} />
      <button type="submit" className="text-sm font-medium text-red-600 hover:underline">
        Delete
      </button>
    </form>
  );
}
