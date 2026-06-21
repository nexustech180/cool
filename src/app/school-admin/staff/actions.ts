"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { generatePasskeyCandidate } from "@/lib/passkey";
import { requireRole } from "@/lib/session";

export type AddTeacherState = {
  error?: string;
  success?: { name: string; phone: string; tempPassword: string };
};

export async function addTeacherAction(
  _prevState: AddTeacherState,
  formData: FormData
): Promise<AddTeacherState> {
  const user = await requireRole("SCHOOL_ADMIN");
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!name || !phone) return { error: "Please fill in the teacher's name and phone number." };

  const tempPassword = generatePasskeyCandidate(10);
  const passwordHash = await bcrypt.hash(tempPassword, 10);

  try {
    await prisma.user.create({
      data: {
        schoolId: user.schoolId!,
        phone,
        name,
        role: "TEACHER",
        passwordHash,
        mustChangePassword: true,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "A staff member with this phone number already exists at your school." };
    }
    throw error;
  }

  revalidatePath("/school-admin/staff");
  revalidatePath("/school-admin");
  return { success: { name, phone, tempPassword } };
}

export type RemoveStaffState = { error?: string };

export async function removeStaffAction(
  _prevState: RemoveStaffState,
  formData: FormData
): Promise<RemoveStaffState> {
  const user = await requireRole("SCHOOL_ADMIN");
  const userId = String(formData.get("userId") ?? "");
  if (!userId) return {};

  const staff = await prisma.user.findFirst({
    where: { id: userId, schoolId: user.schoolId!, role: "TEACHER" },
  });
  if (!staff) return {};

  const [scoreCount, attendanceCount, feeCount] = await Promise.all([
    prisma.score.count({ where: { teacherId: userId } }),
    prisma.attendance.count({ where: { recordedById: userId } }),
    prisma.fee.count({ where: { recordedById: userId } }),
  ]);
  if (scoreCount > 0 || attendanceCount > 0 || feeCount > 0) {
    return { error: `Cannot remove ${staff.name}: they have recorded scores, attendance, or fees.` };
  }

  await prisma.user.delete({ where: { id: userId } });

  revalidatePath("/school-admin/staff");
  revalidatePath("/school-admin/classes");
  revalidatePath("/school-admin");
  return {};
}

export type AssignmentState = { error?: string };

export async function addAssignmentAction(
  _prevState: AssignmentState,
  formData: FormData
): Promise<AssignmentState> {
  const user = await requireRole("SCHOOL_ADMIN");
  const schoolId = user.schoolId!;
  const classId = String(formData.get("classId") ?? "");
  const subjectId = String(formData.get("subjectId") ?? "");
  const teacherId = String(formData.get("teacherId") ?? "");

  if (!classId || !subjectId || !teacherId) {
    return { error: "Please select a class, subject, and teacher." };
  }

  const [klass, subject, teacher] = await Promise.all([
    prisma.class.findFirst({ where: { id: classId, schoolId } }),
    prisma.subject.findFirst({ where: { id: subjectId, schoolId } }),
    prisma.user.findFirst({ where: { id: teacherId, schoolId, role: "TEACHER" } }),
  ]);
  if (!klass || !subject || !teacher) return { error: "Invalid class, subject, or teacher." };

  await prisma.teacherAssignment.upsert({
    where: { classId_subjectId: { classId, subjectId } },
    update: { teacherId },
    create: { schoolId, classId, subjectId, teacherId },
  });

  revalidatePath("/school-admin/staff");
  return {};
}

export async function deleteAssignmentAction(formData: FormData): Promise<void> {
  const user = await requireRole("SCHOOL_ADMIN");
  const assignmentId = String(formData.get("assignmentId") ?? "");
  if (!assignmentId) return;

  await prisma.teacherAssignment.deleteMany({ where: { id: assignmentId, schoolId: user.schoolId! } });

  revalidatePath("/school-admin/staff");
}
