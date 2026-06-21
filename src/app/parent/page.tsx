import Link from "next/link";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";

export default async function ParentOverviewPage() {
  const user = await requireRole("PARENT");
  const schoolId = user.schoolId!;

  const children = await prisma.student.findMany({
    where: { schoolId, parentId: user.id },
    orderBy: { fullName: "asc" },
    include: { class: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Children</h1>
        <p className="mt-1 text-sm text-slate-500">View report cards, attendance, and fees for each of your children.</p>
      </div>

      {children.length === 0 ? (
        <Card>
          <CardBody>
            <p className="text-sm text-slate-500">No children are linked to your account yet. Contact your school.</p>
          </CardBody>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {children.map((child) => (
            <Card key={child.id}>
              <CardHeader title={child.fullName} subtitle={child.class.name} />
              <CardBody className="flex flex-wrap gap-3">
                <Link
                  href={`/parent/report-card/${child.id}`}
                  className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Report card
                </Link>
                <Link
                  href={`/parent/attendance/${child.id}`}
                  className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Attendance
                </Link>
                <Link
                  href={`/parent/fees/${child.id}`}
                  className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Fees
                </Link>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
