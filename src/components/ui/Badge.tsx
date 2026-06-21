type Tone = "green" | "yellow" | "red" | "slate" | "indigo";

const TONE_CLASSES: Record<Tone, string> = {
  green: "bg-green-100 text-green-800",
  yellow: "bg-yellow-100 text-yellow-800",
  red: "bg-red-100 text-red-800",
  slate: "bg-slate-100 text-slate-700",
  indigo: "bg-indigo-100 text-indigo-800",
};

export function Badge({ children, tone = "slate" }: { children: React.ReactNode; tone?: Tone }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${TONE_CLASSES[tone]}`}>
      {children}
    </span>
  );
}

export function feeStatusTone(status: "PAID" | "PARTIAL" | "UNPAID"): Tone {
  if (status === "PAID") return "green";
  if (status === "PARTIAL") return "yellow";
  return "red";
}

export function gradeTone(grade: string): Tone {
  if (grade.startsWith("A")) return "green";
  if (grade.startsWith("B") || grade.startsWith("C")) return "indigo";
  if (grade.startsWith("D") || grade.startsWith("E")) return "yellow";
  return "red";
}
