"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { requireRole } from "@/lib/session";

export type AddClassState = { error?: string };

export async function addClassAction(_prevState: AddClassState, formData: FormData): Promise<AddClassState> {
  const user = await requireRole("SCHOOL_ADMIN");
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Please enter a class name." };

  try {
    await prisma.class.create({ data: { schoolId: user.schoolId!, name } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "A class with this name already exists." };
    }
    throw error;
  }

  revalidatePath("/school-admin/classes");
  revalidatePath("/school-admin");
  return {};
}

export async function assignFormTeacherAction(formData: FormData): Promise<void> {
  const user = await requireRole("SCHOOL_ADMIN");
  const classId = String(formData.get("classId") ?? "");
  const formTeacherId = String(formData.get("formTeacherId") ?? "");
  if (!classId) return;

  const klass = await prisma.class.findFirst({ where: { id: classId, schoolId: user.schoolId! } });
  if (!klass) return;

  await prisma.class.update({
    where: { id: classId },
    data: { formTeacherId: formTeacherId || null },
  });

  revalidatePath("/school-admin/classes");
}

export type DeleteClassState = { error?: string };

export async function deleteClassAction(
  _prevState: DeleteClassState,
  formData: FormData
): Promise<DeleteClassState> {
  const user = await requireRole("SCHOOL_ADMIN");
  const classId = String(formData.get("classId") ?? "");
  if (!classId) return {};

  const klass = await prisma.class.findFirst({
    where: { id: classId, schoolId: user.schoolId! },
    include: { _count: { select: { students: true } } },
  });
  if (!klass) return {};
  if (klass._count.students > 0) {
    return { error: `Cannot delete ${klass.name}: it still has ${klass._count.students} student(s) enrolled.` };
  }

  await prisma.class.delete({ where: { id: classId } });

  revalidatePath("/school-admin/classes");
  revalidatePath("/school-admin");
  return {};
}
