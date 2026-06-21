"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";

export type RegisterParentState = {
  error?: string;
};

export async function registerParentAction(
  _prevState: RegisterParentState,
  formData: FormData
): Promise<RegisterParentState> {
  const schoolId = String(formData.get("schoolId") ?? "").trim();
  const parentName = String(formData.get("parentName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const childFullName = String(formData.get("childFullName") ?? "").trim();
  const classId = String(formData.get("classId") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!schoolId || !parentName || !phone || !childFullName || !classId || !password) {
    return { error: "Please fill in all fields." };
  }
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }
  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const school = await prisma.school.findUnique({ where: { id: schoolId } });
  if (!school) {
    return { error: "School not found. Please use the registration link from your school." };
  }

  const klass = await prisma.class.findFirst({ where: { id: classId, schoolId } });
  if (!klass) {
    return { error: "Please select your child's class." };
  }

  const existingUser = await prisma.user.findFirst({ where: { schoolId, phone } });
  if (existingUser) {
    return { error: "An account with this phone number already exists for this school. Please sign in instead." };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.$transaction(async (tx) => {
    const parent = await tx.user.create({
      data: { phone, passwordHash, name: parentName, role: "PARENT", schoolId },
    });
    await tx.student.create({
      data: { fullName: childFullName, schoolId, classId, parentId: parent.id },
    });
  });

  try {
    await signIn("credentials", { phone, passkey: school.passkey, password, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Account created, but automatic sign-in failed. Please sign in manually." };
    }
    throw error;
  }

  redirect("/parent");
}
