"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge, feeStatusTone } from "@/components/ui/Badge";
import { getFeeStatus } from "@/lib/grading";
import { saveFeesAction, type SaveFeesState } from "./actions";

type StudentRow = { id: string; fullName: string; amountDue: number | null; amountPaid: number | null };

const initialState: SaveFeesState = {};

export function FeeEntryForm({
  classId,
  termId,
  students,
}: {
  classId: string;
  termId: string;
  students: StudentRow[];
}) {
  const [state, formAction, pending] = useActionState(saveFeesAction, initialState);
  const [values, setValues] = useState<Record<string, { amountDue: string; amountPaid: string }>>(() =>
    Object.fromEntries(
      students.map((s) => [
        s.id,
        { amountDue: s.amountDue?.toString() ?? "", amountPaid: s.amountPaid?.toString() ?? "" },
      ])
    )
  );

  function setValue(studentId: string, field: "amountDue" | "amountPaid", value: string) {
    setValues((prev) => ({ ...prev, [studentId]: { ...prev[studentId], [field]: value } }));
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="classId" value={classId} />
      <input type="hidden" name="termId" value={termId} />

      <div className="overflow-x-auto rounded-md border border-slate-100">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b border-slate-100 text-slate-500">
            <tr>
              <th className="px-3 py-2 font-medium">Student</th>
              <th className="px-3 py-2 font-medium">Amount due</th>
              <th className="px-3 py-2 font-medium">Amount paid</th>
              <th className="px-3 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => {
              const row = values[student.id] ?? { amountDue: "", amountPaid: "" };
              const hasInput = row.amountDue !== "" || row.amountPaid !== "";
              const status = hasInput ? getFeeStatus(Number(row.amountDue || 0), Number(row.amountPaid || 0)) : null;
              return (
                <tr key={student.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-3 py-2 font-medium text-slate-900">{student.fullName}</td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      name={`amountDue_${student.id}`}
                      value={row.amountDue}
                      onChange={(e) => setValue(student.id, "amountDue", e.target.value)}
                      className="w-28 rounded-md border border-slate-300 px-2 py-1 text-sm"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      name={`amountPaid_${student.id}`}
                      value={row.amountPaid}
                      onChange={(e) => setValue(student.id, "amountPaid", e.target.value)}
                      className="w-28 rounded-md border border-slate-300 px-2 py-1 text-sm"
                    />
                  </td>
                  <td className="px-3 py-2">
                    {status ? (
                      <Badge tone={feeStatusTone(status)}>{status}</Badge>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="text-sm text-green-700">Fees saved.</p>}

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Saving..." : "Save fees"}
      </Button>
    </form>
  );
}
