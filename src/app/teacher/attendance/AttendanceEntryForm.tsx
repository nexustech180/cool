"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/Button";
import { computeAttendancePercent } from "@/lib/grading";
import { saveAttendanceAction, type SaveAttendanceState } from "./actions";

type StudentRow = { id: string; fullName: string; daysPresent: number | null };

const initialState: SaveAttendanceState = {};

export function AttendanceEntryForm({
  classId,
  termId,
  totalDays,
  students,
}: {
  classId: string;
  termId: string;
  totalDays: number;
  students: StudentRow[];
}) {
  const [state, formAction, pending] = useActionState(saveAttendanceAction, initialState);
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(students.map((s) => [s.id, s.daysPresent?.toString() ?? ""]))
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="classId" value={classId} />
      <input type="hidden" name="termId" value={termId} />

      <div className="overflow-x-auto rounded-md border border-slate-100">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead className="border-b border-slate-100 text-slate-500">
            <tr>
              <th className="px-3 py-2 font-medium">Student</th>
              <th className="px-3 py-2 font-medium">Days present</th>
              <th className="px-3 py-2 font-medium">Attendance %</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => {
              const value = values[student.id] ?? "";
              const percent = value !== "" ? computeAttendancePercent(Number(value || 0), totalDays) : null;
              return (
                <tr key={student.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-3 py-2 font-medium text-slate-900">{student.fullName}</td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min={0}
                      max={totalDays}
                      name={`daysPresent_${student.id}`}
                      value={value}
                      onChange={(e) => setValues((prev) => ({ ...prev, [student.id]: e.target.value }))}
                      className="w-20 rounded-md border border-slate-300 px-2 py-1 text-sm"
                    />
                    <span className="ml-1 text-xs text-slate-400">/{totalDays}</span>
                  </td>
                  <td className="px-3 py-2 text-slate-700">{percent !== null ? `${percent.toFixed(1)}%` : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="text-sm text-green-700">Attendance saved.</p>}

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Saving..." : "Save attendance"}
      </Button>
    </form>
  );
}
