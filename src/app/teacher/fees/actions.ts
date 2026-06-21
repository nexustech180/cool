"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export type SaveFeesState = { error?: string; success?: boolean };

export async function saveFeesAction(_prevState: SaveFeesState, formData: FormData): Promise<SaveFeesState> {
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
    const dueRaw = formData.get(`amountDue_${student.id}`);
    const paidRaw = formData.get(`amountPaid_${student.id}`);
    if (dueRaw === null && paidRaw === null) continue;
    const dueTrim = String(dueRaw ?? "").trim();
    const paidTrim = String(paidRaw ?? "").trim();
    if (!dueTrim && !paidTrim) continue;

    const amountDue = Number(dueTrim || 0);
    const amountPaid = Number(paidTrim || 0);
    if (Number.isNaN(amountDue) || Number.isNaN(amountPaid)) continue;

    await prisma.fee.upsert({
      where: { studentId_termId: { studentId: student.id, termId } },
      update: { amountDue, amountPaid, recordedById: user.id },
      create: { studentId: student.id, termId, amountDue, amountPaid, recordedById: user.id },
    });
  }

  revalidatePath("/teacher/fees");
  return { success: true };
}
