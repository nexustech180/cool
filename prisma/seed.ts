import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { DEFAULT_GRADE_BOUNDARIES, computeResult } from "@/lib/grading";

async function hash(password: string) {
  return bcrypt.hash(password, 10);
}

async function main() {
  console.log("Seeding database...");

  const existingSuperAdmin = await prisma.user.findFirst({
    where: { phone: "08000000000", schoolId: null },
  });
  if (!existingSuperAdmin) {
    await prisma.user.create({
      data: {
        phone: "08000000000",
        name: "Platform Owner",
        role: "SUPER_ADMIN",
        passwordHash: await hash("admin123"),
        schoolId: null,
      },
    });
  }

  const school = await prisma.school.upsert({
    where: { passkey: "SUNRISE1" },
    update: {},
    create: {
      name: "Sunrise Academy",
      passkey: "SUNRISE1",
      subscriptionStatus: "ACTIVE",
      subscriptionPlan: "PRO",
    },
  });

  await prisma.weightageSetting.upsert({
    where: { schoolId: school.id },
    update: {},
    create: { schoolId: school.id, classScoreWeight: 40 },
  });

  for (const b of DEFAULT_GRADE_BOUNDARIES) {
    const existing = await prisma.gradeBoundary.findFirst({
      where: { schoolId: school.id, grade: b.grade },
    });
    if (!existing) {
      await prisma.gradeBoundary.create({
        data: { schoolId: school.id, ...b },
      });
    }
  }

  const schoolAdmin = await prisma.user.upsert({
    where: { schoolId_phone: { schoolId: school.id, phone: "08011111111" } },
    update: {},
    create: {
      phone: "08011111111",
      name: "Mrs. Adeola Bankole",
      role: "SCHOOL_ADMIN",
      passwordHash: await hash("admin123"),
      schoolId: school.id,
    },
  });

  const classA = await prisma.class.upsert({
    where: { schoolId_name: { schoolId: school.id, name: "JSS1A" } },
    update: {},
    create: { schoolId: school.id, name: "JSS1A" },
  });
  const classB = await prisma.class.upsert({
    where: { schoolId_name: { schoolId: school.id, name: "JSS1B" } },
    update: {},
    create: { schoolId: school.id, name: "JSS1B" },
  });

  const math = await prisma.subject.upsert({
    where: { schoolId_name: { schoolId: school.id, name: "Mathematics" } },
    update: {},
    create: { schoolId: school.id, name: "Mathematics" },
  });
  const english = await prisma.subject.upsert({
    where: { schoolId_name: { schoolId: school.id, name: "English Language" } },
    update: {},
    create: { schoolId: school.id, name: "English Language" },
  });

  const teacherA = await prisma.user.upsert({
    where: { schoolId_phone: { schoolId: school.id, phone: "08022222222" } },
    update: {},
    create: {
      phone: "08022222222",
      name: "Mr. Chinedu Okafor",
      role: "TEACHER",
      passwordHash: await hash("teacher123"),
      mustChangePassword: true,
      schoolId: school.id,
    },
  });
  const teacherB = await prisma.user.upsert({
    where: { schoolId_phone: { schoolId: school.id, phone: "08033333333" } },
    update: {},
    create: {
      phone: "08033333333",
      name: "Miss Funke Ojo",
      role: "TEACHER",
      passwordHash: await hash("teacher123"),
      mustChangePassword: true,
      schoolId: school.id,
    },
  });

  await prisma.class.update({
    where: { id: classA.id },
    data: { formTeacherId: teacherA.id },
  });

  for (const [classId, subjectId, teacherId] of [
    [classA.id, math.id, teacherA.id],
    [classA.id, english.id, teacherA.id],
    [classB.id, math.id, teacherB.id],
    [classB.id, english.id, teacherB.id],
  ]) {
    await prisma.teacherAssignment.upsert({
      where: { classId_subjectId: { classId, subjectId } },
      update: { teacherId },
      create: { schoolId: school.id, classId, subjectId, teacherId },
    });
  }

  const term = await prisma.term.upsert({
    where: { schoolId_name: { schoolId: school.id, name: "First Term 2025/2026" } },
    update: {},
    create: {
      schoolId: school.id,
      name: "First Term 2025/2026",
      startDate: new Date("2025-09-15"),
      endDate: new Date("2025-12-12"),
      totalDays: 60,
      isActive: true,
    },
  });

  const studentDefs = [
    { fullName: "Tobi Johnson", classId: classA.id },
    { fullName: "Amaka Eze", classId: classA.id },
    { fullName: "David Williams", classId: classB.id },
    { fullName: "Grace Nwosu", classId: classB.id },
  ];

  const students = [];
  for (const def of studentDefs) {
    const existing = await prisma.student.findFirst({
      where: { schoolId: school.id, classId: def.classId, fullName: def.fullName },
    });
    students.push(
      existing ??
        (await prisma.student.create({
          data: { schoolId: school.id, classId: def.classId, fullName: def.fullName },
        }))
    );
  }

  const parentDefs = [
    { phone: "08044444444", name: "Mrs. Bisi Johnson", studentIndex: 0 },
    { phone: "08055555555", name: "Mr. Emeka Williams", studentIndex: 2 },
  ];
  for (const def of parentDefs) {
    const parent = await prisma.user.upsert({
      where: { schoolId_phone: { schoolId: school.id, phone: def.phone } },
      update: {},
      create: {
        phone: def.phone,
        name: def.name,
        role: "PARENT",
        passwordHash: await hash("parent123"),
        schoolId: school.id,
      },
    });
    await prisma.student.update({
      where: { id: students[def.studentIndex].id },
      data: { parentId: parent.id },
    });
  }

  const weightage = await prisma.weightageSetting.findUniqueOrThrow({ where: { schoolId: school.id } });
  const boundaries = await prisma.gradeBoundary.findMany({ where: { schoolId: school.id } });

  const scoreSeeds = [
    { studentIdx: 0, subjectId: math.id, classScoreRaw: 17, examScoreRaw: 70 },
    { studentIdx: 0, subjectId: english.id, classScoreRaw: 15, examScoreRaw: 60 },
    { studentIdx: 1, subjectId: math.id, classScoreRaw: 19, examScoreRaw: 88 },
    { studentIdx: 1, subjectId: english.id, classScoreRaw: 18, examScoreRaw: 80 },
    { studentIdx: 2, subjectId: math.id, classScoreRaw: 12, examScoreRaw: 45 },
    { studentIdx: 2, subjectId: english.id, classScoreRaw: 14, examScoreRaw: 55 },
    { studentIdx: 3, subjectId: math.id, classScoreRaw: 20, examScoreRaw: 95 },
    { studentIdx: 3, subjectId: english.id, classScoreRaw: 16, examScoreRaw: 75 },
  ];

  for (const s of scoreSeeds) {
    const teacherId = students[s.studentIdx].classId === classA.id ? teacherA.id : teacherB.id;

    const raw = {
      classScoreRaw: s.classScoreRaw,
      classScoreMax: 20,
      examScoreRaw: s.examScoreRaw,
      examScoreMax: 100,
    };
    const result = computeResult(raw, weightage.classScoreWeight, boundaries);

    await prisma.score.upsert({
      where: {
        studentId_subjectId_termId: {
          studentId: students[s.studentIdx].id,
          subjectId: s.subjectId,
          termId: term.id,
        },
      },
      update: {},
      create: {
        studentId: students[s.studentIdx].id,
        subjectId: s.subjectId,
        termId: term.id,
        teacherId,
        ...raw,
        scaledClassScore: result.scaledClassScore,
        scaledExamScore: result.scaledExamScore,
        totalPercent: result.totalPercent,
        grade: result.grade,
        remark: result.remark,
      },
    });
  }

  for (const [idx, daysPresent] of [[0, 56], [1, 59], [2, 50], [3, 60]] as const) {
    await prisma.attendance.upsert({
      where: { studentId_termId: { studentId: students[idx].id, termId: term.id } },
      update: {},
      create: {
        studentId: students[idx].id,
        termId: term.id,
        daysPresent,
        recordedById: teacherA.id,
      },
    });
  }

  for (const [idx, amountDue, amountPaid] of [
    [0, 50000, 50000],
    [1, 50000, 25000],
    [2, 50000, 0],
    [3, 50000, 50000],
  ] as const) {
    await prisma.fee.upsert({
      where: { studentId_termId: { studentId: students[idx].id, termId: term.id } },
      update: {},
      create: {
        studentId: students[idx].id,
        termId: term.id,
        amountDue,
        amountPaid,
        recordedById: teacherA.id,
      },
    });
  }

  console.log("Seed complete.");
  console.log("");
  console.log("Demo logins (phone / school passkey / password):");
  console.log("  Super Admin:  08000000000 / admin       / admin123");
  console.log("  School Admin: 08011111111 / SUNRISE1    / admin123");
  console.log("  Teacher (Form Teacher of JSS1A): 08022222222 / SUNRISE1 / teacher123");
  console.log("  Teacher: 08033333333 / SUNRISE1 / teacher123");
  console.log("  Parent: 08044444444 / SUNRISE1 / parent123");
  console.log("  Parent: 08055555555 / SUNRISE1 / parent123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
