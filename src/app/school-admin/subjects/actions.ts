"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { requireRole } from "@/lib/session";

export type AddSubjectState = { error?: string };

export async function addSubjectAction(
  _prevState: AddSubjectState,
  formData: FormData
): Promise<AddSubjectState> {
  const user = await requireRole("SCHOOL_ADMIN");
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Please enter a subject name." };

  try {
    await prisma.subject.create({ data: { schoolId: user.schoolId!, name } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "A subject with this name already exists." };
    }
    throw error;
  }

  revalidatePath("/school-admin/subjects");
  revalidatePath("/school-admin");
  return {};
}

export async function deleteSubjectAction(formData: FormData): Promise<void> {
  const user = await requireRole("SCHOOL_ADMIN");
  const subjectId = String(formData.get("subjectId") ?? "");
  if (!subjectId) return;

  await prisma.subject.deleteMany({ where: { id: subjectId, schoolId: user.schoolId! } });

  revalidatePath("/school-admin/subjects");
  revalidatePath("/school-admin");
}
