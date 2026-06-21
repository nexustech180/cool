"use client";

import { useRouter } from "next/navigation";

export function TermPicker({
  terms,
  termId,
  basePath,
}: {
  terms: { id: string; name: string }[];
  termId: string;
  basePath: string;
}) {
  const router = useRouter();

  if (terms.length <= 1) return null;

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-slate-700">Term</label>
      <select
        className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        value={termId}
        onChange={(e) => router.push(`${basePath}?termId=${e.target.value}`)}
      >
        {terms.map((term) => (
          <option key={term.id} value={term.id}>
            {term.name}
          </option>
        ))}
      </select>
    </div>
  );
}
