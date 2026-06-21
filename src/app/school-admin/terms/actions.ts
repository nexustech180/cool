"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { requireRole } from "@/lib/session";

export type AddTermState = { error?: string };

export async function addTermAction(_prevState: AddTermState, formData: FormData): Promise<AddTermState> {
  const user = await requireRole("SCHOOL_ADMIN");
  const name = String(formData.get("name") ?? "").trim();
  const startDate = String(formData.get("startDate") ?? "");
  const endDate = String(formData.get("endDate") ?? "");
  const totalDays = Number(formData.get("totalDays") ?? 0);

  if (!name || !startDate || !endDate) {
    return { error: "Please fill in the term name, start date, and end date." };
  }
  if (!Number.isFinite(totalDays) || totalDays <= 0) {
    return { error: "Total days must be a positive number." };
  }
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (end <= start) {
    return { error: "End date must be after the start date." };
  }

  try {
    await prisma.term.create({
      data: { schoolId: user.schoolId!, name, startDate: start, endDate: end, totalDays },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "A term with this name already exists." };
    }
    throw error;
  }

  revalidatePath("/school-admin/terms");
  revalidatePath("/school-admin");
  return {};
}

export async function setActiveTermAction(formData: FormData): Promise<void> {
  const user = await requireRole("SCHOOL_ADMIN");
  const termId = String(formData.get("termId") ?? "");
  if (!termId) return;

  const term = await prisma.term.findFirst({ where: { id: termId, schoolId: user.schoolId! } });
  if (!term) return;

  await prisma.$transaction([
    prisma.term.updateMany({ where: { schoolId: user.schoolId! }, data: { isActive: false } }),
    prisma.term.update({ where: { id: termId }, data: { isActive: true } }),
  ]);

  revalidatePath("/school-admin/terms");
  revalidatePath("/school-admin");
}

export async function deleteTermAction(formData: FormData): Promise<void> {
  const user = await requireRole("SCHOOL_ADMIN");
  const termId = String(formData.get("termId") ?? "");
  if (!termId) return;

  await prisma.term.deleteMany({ where: { id: termId, schoolId: user.schoolId! } });

  revalidatePath("/school-admin/terms");
  revalidatePath("/school-admin");
}
