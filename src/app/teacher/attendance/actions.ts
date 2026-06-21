"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export type SaveAttendanceState = { error?: string; success?: boolean };

export async function saveAttendanceAction(
  _prevState: SaveAttendanceState,
  formData: FormData
): Promise<SaveAttendanceState> {
  const user = await requireRole("TEACHER");
  const schoolId = user.schoolId!;
  const classId = String(formData.get("classId") ?? "");
  const termId = String(formData.get("termId") ?? "");
  if (!classId || !termId) return { error: "Missing class or term." };

  const [klass, term, students] = await Promise.all([
    prisma.class.findFirst({ where: { id: classId, schoolId, formTeacherId: user.id } }),
    prisma.term.findFirst({ where: { id: termId, schoolId } }),
    prisma.student.findMany({ where: { schoolId, classId } }),
  ]);
  if (!klass) return { error: "You are not the form teacher of this class." };
  if (!term) return { error: "Invalid term." };

  for (const student of students) {
    const raw = formData.get(`daysPresent_${student.id}`);
    if (raw === null) continue;
    const trimmed = String(raw).trim();
    if (!trimmed) continue;
    const daysPresent = Number(trimmed);
    if (Number.isNaN(daysPresent)) continue;

    await prisma.attendance.upsert({
      where: { studentId_termId: { studentId: student.id, termId } },
      update: { daysPresent, recordedById: user.id },
      create: { studentId: student.id, termId, daysPresent, recordedById: user.id },
    });
  }

  revalidatePath("/teacher/attendance");
  return { success: true };
}
