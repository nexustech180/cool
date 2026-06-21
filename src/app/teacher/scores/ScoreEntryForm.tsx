"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge, gradeTone } from "@/components/ui/Badge";
import { computeResult, type GradeBoundaryInput } from "@/lib/grading";
import { saveScoresAction, type SaveScoresState } from "./actions";

type StudentRow = {
  id: string;
  fullName: string;
  classScoreRaw: number | null;
  examScoreRaw: number | null;
};

const initialState: SaveScoresState = {};

export function ScoreEntryForm({
  classId,
  subjectId,
  termId,
  students,
  classScoreWeight,
  boundaries,
  initialClassScoreMax,
  initialExamScoreMax,
}: {
  classId: string;
  subjectId: string;
  termId: string;
  students: StudentRow[];
  classScoreWeight: number;
  boundaries: GradeBoundaryInput[];
  initialClassScoreMax: number;
  initialExamScoreMax: number;
}) {
  const [state, formAction, pending] = useActionState(saveScoresAction, initialState);
  const [classScoreMax, setClassScoreMax] = useState(initialClassScoreMax);
  const [examScoreMax, setExamScoreMax] = useState(initialExamScoreMax);
  const [values, setValues] = useState<Record<string, { classScoreRaw: string; examScoreRaw: string }>>(() =>
    Object.fromEntries(
      students.map((s) => [
        s.id,
        { classScoreRaw: s.classScoreRaw?.toString() ?? "", examScoreRaw: s.examScoreRaw?.toString() ?? "" },
      ])
    )
  );

  function setValue(studentId: string, field: "classScoreRaw" | "examScoreRaw", value: string) {
    setValues((prev) => ({ ...prev, [studentId]: { ...prev[studentId], [field]: value } }));
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="classId" value={classId} />
      <input type="hidden" name="subjectId" value={subjectId} />
      <input type="hidden" name="termId" value={termId} />

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">Class score max</label>
          <input
            type="number"
            name="classScoreMax"
            min={1}
            value={classScoreMax}
            onChange={(e) => setClassScoreMax(Number(e.target.value))}
            className="w-24 rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">Exam score max</label>
          <input
            type="number"
            name="examScoreMax"
            min={1}
            value={examScoreMax}
            onChange={(e) => setExamScoreMax(Number(e.target.value))}
            className="w-24 rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border border-slate-100">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-slate-100 text-slate-500">
            <tr>
              <th className="px-3 py-2 font-medium">Student</th>
              <th className="px-3 py-2 font-medium">Class score</th>
              <th className="px-3 py-2 font-medium">Exam score</th>
              <th className="px-3 py-2 font-medium">Total %</th>
              <th className="px-3 py-2 font-medium">Grade</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => {
              const row = values[student.id] ?? { classScoreRaw: "", examScoreRaw: "" };
              const hasInput = row.classScoreRaw !== "" || row.examScoreRaw !== "";
              const result = hasInput
                ? computeResult(
                    {
                      classScoreRaw: Number(row.classScoreRaw || 0),
                      classScoreMax,
                      examScoreRaw: Number(row.examScoreRaw || 0),
                      examScoreMax,
                    },
                    classScoreWeight,
                    boundaries
                  )
                : null;

              return (
                <tr key={student.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-3 py-2 font-medium text-slate-900">{student.fullName}</td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      max={classScoreMax}
                      name={`classScoreRaw_${student.id}`}
                      value={row.classScoreRaw}
                      onChange={(e) => setValue(student.id, "classScoreRaw", e.target.value)}
                      className="w-20 rounded-md border border-slate-300 px-2 py-1 text-sm"
                    />
                    <span className="ml-1 text-xs text-slate-400">/{classScoreMax}</span>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      max={examScoreMax}
                      name={`examScoreRaw_${student.id}`}
                      value={row.examScoreRaw}
                      onChange={(e) => setValue(student.id, "examScoreRaw", e.target.value)}
                      className="w-20 rounded-md border border-slate-300 px-2 py-1 text-sm"
                    />
                    <span className="ml-1 text-xs text-slate-400">/{examScoreMax}</span>
                  </td>
                  <td className="px-3 py-2 text-slate-700">{result ? `${result.totalPercent.toFixed(1)}%` : "—"}</td>
                  <td className="px-3 py-2">
                    {result ? (
                      <Badge tone={gradeTone(result.grade)}>{result.grade}</Badge>
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
      {state.success && <p className="text-sm text-green-700">Scores saved.</p>}

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Saving..." : "Save scores"}
      </Button>
    </form>
  );
}
