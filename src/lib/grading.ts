export type GradeBoundaryInput = {
  minPercent: number;
  maxPercent: number;
  grade: string;
  remark: string;
};

export type RawScoreInput = {
  classScoreRaw: number;
  classScoreMax: number;
  examScoreRaw: number;
  examScoreMax: number;
};

export type ComputedResult = {
  scaledClassScore: number;
  scaledExamScore: number;
  totalPercent: number;
  grade: string;
  remark: string;
};

export function getExamWeight(classScoreWeight: number): number {
  return 100 - classScoreWeight;
}

// Scales a raw score (e.g. 17/20) onto its weighted share of the total (e.g. 40%).
function scale(raw: number, max: number, weight: number): number {
  if (max <= 0) return 0;
  const ratio = raw / max;
  return clampPercent(ratio * weight);
}

function clampPercent(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

export function findGradeForPercent(
  boundaries: GradeBoundaryInput[],
  percent: number
): { grade: string; remark: string } {
  const sorted = [...boundaries].sort((a, b) => b.minPercent - a.minPercent);
  const match = sorted.find((b) => percent >= b.minPercent && percent <= b.maxPercent);
  if (match) return { grade: match.grade, remark: match.remark };
  return { grade: "N/A", remark: "No grade boundary configured" };
}

export function computeResult(
  raw: RawScoreInput,
  classScoreWeight: number,
  boundaries: GradeBoundaryInput[]
): ComputedResult {
  const examWeight = getExamWeight(classScoreWeight);
  const scaledClassScore = scale(raw.classScoreRaw, raw.classScoreMax, classScoreWeight);
  const scaledExamScore = scale(raw.examScoreRaw, raw.examScoreMax, examWeight);
  const totalPercent = clampPercent(scaledClassScore + scaledExamScore);
  const { grade, remark } = findGradeForPercent(boundaries, totalPercent);
  return { scaledClassScore, scaledExamScore, totalPercent, grade, remark };
}

export function computeAttendancePercent(daysPresent: number, totalDays: number): number {
  if (totalDays <= 0) return 0;
  return clampPercent((daysPresent / totalDays) * 100);
}

export type FeeStatus = "PAID" | "PARTIAL" | "UNPAID";

export function getFeeStatus(amountDue: number, amountPaid: number): FeeStatus {
  if (amountPaid <= 0) return "UNPAID";
  if (amountPaid >= amountDue) return "PAID";
  return "PARTIAL";
}

// Standard WAEC-style scale, used to seed new schools (School Admins can edit it).
export const DEFAULT_GRADE_BOUNDARIES: GradeBoundaryInput[] = [
  { minPercent: 75, maxPercent: 100, grade: "A1", remark: "Excellent" },
  { minPercent: 70, maxPercent: 74.99, grade: "B2", remark: "Very Good" },
  { minPercent: 65, maxPercent: 69.99, grade: "B3", remark: "Good" },
  { minPercent: 60, maxPercent: 64.99, grade: "C4", remark: "Credit" },
  { minPercent: 55, maxPercent: 59.99, grade: "C5", remark: "Credit" },
  { minPercent: 50, maxPercent: 54.99, grade: "C6", remark: "Credit" },
  { minPercent: 45, maxPercent: 49.99, grade: "D7", remark: "Pass" },
  { minPercent: 40, maxPercent: 44.99, grade: "E8", remark: "Pass" },
  { minPercent: 0, maxPercent: 39.99, grade: "F9", remark: "Fail" },
];
