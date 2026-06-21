"use client";

import { useRouter } from "next/navigation";

type Assignment = { classId: string; className: string; subjectId: string; subjectName: string };

export function ScorePicker({
  assignments,
  classId,
  subjectId,
}: {
  assignments: Assignment[];
  classId: string;
  subjectId: string;
}) {
  const router = useRouter();
  const classes = Array.from(new Map(assignments.map((a) => [a.classId, a.className])).entries());
  const subjectsForClass = assignments.filter((a) => a.classId === classId);

  function go(nextClassId: string, nextSubjectId: string) {
    router.push(`/teacher/scores?classId=${nextClassId}&subjectId=${nextSubjectId}`);
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700">Class</label>
        <select
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          value={classId}
          onChange={(e) => {
            const nextClassId = e.target.value;
            const firstSubject = assignments.find((a) => a.classId === nextClassId);
            go(nextClassId, firstSubject?.subjectId ?? "");
          }}
        >
          {classes.map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700">Subject</label>
        <select
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          value={subjectId}
          onChange={(e) => go(classId, e.target.value)}
        >
          {subjectsForClass.map((a) => (
            <option key={a.subjectId} value={a.subjectId}>
              {a.subjectName}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
