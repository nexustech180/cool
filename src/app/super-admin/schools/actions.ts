"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { generatePasskeyCandidate } from "@/lib/passkey";
import { DEFAULT_GRADE_BOUNDARIES } from "@/lib/grading";
import { SUBSCRIPTION_STATUSES, type SubscriptionStatus } from "@/lib/types";
import { requireRole } from "@/lib/session";

export type AddSchoolState = {
  error?: string;
  success?: { schoolName: string; passkey: string };
};

async function generateUniqueSchoolPasskey(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = generatePasskeyCandidate();
    const existing = await prisma.school.findUnique({ where: { passkey: candidate } });
    if (!existing) return candidate;
  }
  throw new Error("Could not generate a unique passkey. Please try again.");
}

export async function addSchoolAction(
  _prevState: AddSchoolState,
  formData: FormData
): Promise<AddSchoolState> {
  await requireRole("SUPER_ADMIN");

  const schoolName = String(formData.get("schoolName") ?? "").trim();
  const adminName = String(formData.get("adminName") ?? "").trim();
  const adminPhone = String(formData.get("adminPhone") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!schoolName || !adminName || !adminPhone || !password) {
    return { error: "Please fill in all fields." };
  }
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  const passkey = await generateUniqueSchoolPasskey();
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.$transaction(async (tx) => {
    const school = await tx.school.create({ data: { name: schoolName, passkey } });
    await tx.user.create({
      data: { phone: adminPhone, passwordHash, name: adminName, role: "SCHOOL_ADMIN", schoolId: school.id },
    });
    await tx.weightageSetting.create({ data: { schoolId: school.id, classScoreWeight: 40 } });
    await tx.gradeBoundary.createMany({
      data: DEFAULT_GRADE_BOUNDARIES.map((boundary) => ({ ...boundary, schoolId: school.id })),
    });
  });

  revalidatePath("/super-admin/schools");
  revalidatePath("/super-admin");
  return { success: { schoolName, passkey } };
}

export async function updateSchoolAction(formData: FormData): Promise<void> {
  await requireRole("SUPER_ADMIN");

  const schoolId = String(formData.get("schoolId") ?? "");
  const subscriptionStatus = String(formData.get("subscriptionStatus") ?? "");
  const subscriptionPlan = String(formData.get("subscriptionPlan") ?? "");

  if (!schoolId || !SUBSCRIPTION_STATUSES.includes(subscriptionStatus as SubscriptionStatus)) return;

  await prisma.school.update({
    where: { id: schoolId },
    data: { subscriptionStatus, subscriptionPlan: subscriptionPlan || "FREE" },
  });

  revalidatePath("/super-admin/schools");
  revalidatePath("/super-admin");
}

export async function regeneratePasskeyAction(formData: FormData): Promise<void> {
  await requireRole("SUPER_ADMIN");

  const schoolId = String(formData.get("schoolId") ?? "");
  if (!schoolId) return;

  const passkey = await generateUniqueSchoolPasskey();
  await prisma.school.update({ where: { id: schoolId }, data: { passkey } });

  revalidatePath("/super-admin/schools");
}

export async function deleteSchoolAction(formData: FormData): Promise<void> {
  await requireRole("SUPER_ADMIN");

  const schoolId = String(formData.get("schoolId") ?? "");
  if (!schoolId) return;

  await prisma.school.delete({ where: { id: schoolId } });

  revalidatePath("/super-admin/schools");
  revalidatePath("/super-admin");
}
