"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generatePasskeyCandidate } from "@/lib/passkey";
import { DEFAULT_GRADE_BOUNDARIES } from "@/lib/grading";

export type RegisterSchoolState = {
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

export async function registerSchoolAction(
  _prevState: RegisterSchoolState,
  formData: FormData
): Promise<RegisterSchoolState> {
  const schoolName = String(formData.get("schoolName") ?? "").trim();
  const adminName = String(formData.get("adminName") ?? "").trim();
  const adminPhone = String(formData.get("adminPhone") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!schoolName || !adminName || !adminPhone || !password) {
    return { error: "Please fill in all fields." };
  }
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }
  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const passkey = await generateUniqueSchoolPasskey();
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.$transaction(async (tx) => {
    const school = await tx.school.create({
      data: { name: schoolName, passkey },
    });
    await tx.user.create({
      data: {
        phone: adminPhone,
        passwordHash,
        name: adminName,
        role: "SCHOOL_ADMIN",
        schoolId: school.id,
      },
    });
    await tx.weightageSetting.create({
      data: { schoolId: school.id, classScoreWeight: 40 },
    });
    await tx.gradeBoundary.createMany({
      data: DEFAULT_GRADE_BOUNDARIES.map((boundary) => ({ ...boundary, schoolId: school.id })),
    });
  });

  try {
    await signIn("credentials", { phone: adminPhone, passkey, password, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "School created, but automatic sign-in failed. Please sign in manually." };
    }
    throw error;
  }

  return { success: { schoolName, passkey } };
}
