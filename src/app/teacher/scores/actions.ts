"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { computeResult } from "@/lib/grading";

export type SaveScoresState = { error?: string; success?: boolean };

export async function saveScoresAction(_prevState: SaveScoresState, formData: FormData): Promise<SaveScoresState> {
  const user = await requireRole("TEACHER");
  const schoolId = user.schoolId!;
  const classId = String(formData.get("classId") ?? "");
  const subjectId = String(formData.get("subjectId") ?? "");
  const termId = String(formData.get("termId") ?? "");
  const classScoreMax = Number(formData.get("classScoreMax") ?? 100);
  const examScoreMax = Number(formData.get("examScoreMax") ?? 100);

  if (!classId || !subjectId || !termId) return { error: "Missing class, subject, or term." };
  if (!(classScoreMax > 0) || !(examScoreMax > 0)) return { error: "Score maximums must be positive numbers." };

  const [assignment, term, weightage, boundaries, students] = await Promise.all([
    prisma.teacherAssignment.findFirst({ where: { schoolId, classId, subjectId, teacherId: user.id } }),
    prisma.term.findFirst({ where: { id: termId, schoolId } }),
    prisma.weightageSetting.findUnique({ where: { schoolId } }),
    prisma.gradeBoundary.findMany({ where: { schoolId } }),
    prisma.student.findMany({ where: { schoolId, classId } }),
  ]);

  if (!assignment) return { error: "You are not assigned to teach this subject in this class." };
  if (!term) return { error: "Invalid term." };

  const classScoreWeight = weightage?.classScoreWeight ?? 40;

  for (const student of students) {
    const classScoreRawRaw = formData.get(`classScoreRaw_${student.id}`);
    const examScoreRawRaw = formData.get(`examScoreRaw_${student.id}`);
    if (classScoreRawRaw === null && examScoreRawRaw === null) continue;

    const classScoreRawTrim = String(classScoreRawRaw ?? "").trim();
    const examScoreRawTrim = String(examScoreRawRaw ?? "").trim();
    if (!classScoreRawTrim && !examScoreRawTrim) continue;

    const classScoreRaw = Number(classScoreRawTrim || 0);
    const examScoreRaw = Number(examScoreRawTrim || 0);
    if (Number.isNaN(classScoreRaw) || Number.isNaN(examScoreRaw)) continue;

    const result = computeResult(
      { classScoreRaw, classScoreMax, examScoreRaw, examScoreMax },
      classScoreWeight,
      boundaries
    );

    await prisma.score.upsert({
      where: { studentId_subjectId_termId: { studentId: student.id, subjectId, termId } },
      update: {
        classScoreRaw,
        classScoreMax,
        examScoreRaw,
        examScoreMax,
        scaledClassScore: result.scaledClassScore,
        scaledExamScore: result.scaledExamScore,
        totalPercent: result.totalPercent,
        grade: result.grade,
        remark: result.remark,
        teacherId: user.id,
      },
      create: {
        studentId: student.id,
        subjectId,
        termId,
        teacherId: user.id,
        classScoreRaw,
        classScoreMax,
        examScoreRaw,
        examScoreMax,
        scaledClassScore: result.scaledClassScore,
        scaledExamScore: result.scaledExamScore,
        totalPercent: result.totalPercent,
        grade: result.grade,
        remark: result.remark,
      },
    });
  }

  revalidatePath("/teacher/scores");
  return { success: true };
}
