"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export async function updateWeightageAction(formData: FormData): Promise<void> {
  const user = await requireRole("SCHOOL_ADMIN");
  const classScoreWeight = Number(formData.get("classScoreWeight") ?? NaN);
  if (!Number.isFinite(classScoreWeight) || classScoreWeight < 0 || classScoreWeight > 100) return;

  await prisma.weightageSetting.upsert({
    where: { schoolId: user.schoolId! },
    update: { classScoreWeight },
    create: { schoolId: user.schoolId!, classScoreWeight },
  });

  revalidatePath("/school-admin/grading");
}

export type AddGradeBoundaryState = { error?: string };

export async function addGradeBoundaryAction(
  _prevState: AddGradeBoundaryState,
  formData: FormData
): Promise<AddGradeBoundaryState> {
  const user = await requireRole("SCHOOL_ADMIN");
  const minPercent = Number(formData.get("minPercent") ?? NaN);
  const maxPercent = Number(formData.get("maxPercent") ?? NaN);
  const grade = String(formData.get("grade") ?? "").trim();
  const remark = String(formData.get("remark") ?? "").trim();

  if (!grade || !remark) return { error: "Please fill in the grade and remark." };
  if (!Number.isFinite(minPercent) || !Number.isFinite(maxPercent) || minPercent < 0 || maxPercent > 100) {
    return { error: "Percent values must be between 0 and 100." };
  }
  if (minPercent >= maxPercent) {
    return { error: "Minimum percent must be less than maximum percent." };
  }

  await prisma.gradeBoundary.create({
    data: { schoolId: user.schoolId!, minPercent, maxPercent, grade, remark },
  });

  revalidatePath("/school-admin/grading");
  return {};
}

export async function updateGradeBoundaryAction(formData: FormData): Promise<void> {
  const user = await requireRole("SCHOOL_ADMIN");
  const boundaryId = String(formData.get("boundaryId") ?? "");
  const minPercent = Number(formData.get("minPercent") ?? NaN);
  const maxPercent = Number(formData.get("maxPercent") ?? NaN);
  const grade = String(formData.get("grade") ?? "").trim();
  const remark = String(formData.get("remark") ?? "").trim();

  if (!boundaryId || !grade || !remark) return;
  if (!Number.isFinite(minPercent) || !Number.isFinite(maxPercent) || minPercent >= maxPercent) return;

  const boundary = await prisma.gradeBoundary.findFirst({ where: { id: boundaryId, schoolId: user.schoolId! } });
  if (!boundary) return;

  await prisma.gradeBoundary.update({
    where: { id: boundaryId },
    data: { minPercent, maxPercent, grade, remark },
  });

  revalidatePath("/school-admin/grading");
}

export async function deleteGradeBoundaryAction(formData: FormData): Promise<void> {
  const user = await requireRole("SCHOOL_ADMIN");
  const boundaryId = String(formData.get("boundaryId") ?? "");
  if (!boundaryId) return;

  await prisma.gradeBoundary.deleteMany({ where: { id: boundaryId, schoolId: user.schoolId! } });

  revalidatePath("/school-admin/grading");
}
