"use client";

import { useRouter } from "next/navigation";

export function ClassPicker({
  classes,
  classId,
  basePath,
}: {
  classes: { id: string; name: string }[];
  classId: string;
  basePath: string;
}) {
  const router = useRouter();

  if (classes.length <= 1) return null;

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-slate-700">Class</label>
      <select
        className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        value={classId}
        onChange={(e) => router.push(`${basePath}?classId=${e.target.value}`)}
      >
        {classes.map((klass) => (
          <option key={klass.id} value={klass.id}>
            {klass.name}
          </option>
        ))}
      </select>
    </div>
  );
}
