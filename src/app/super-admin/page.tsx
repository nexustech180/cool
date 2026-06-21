import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

function statusTone(status: string) {
  if (status === "ACTIVE") return "green" as const;
  if (status === "TRIAL") return "yellow" as const;
  return "red" as const;
}

export default async function SuperAdminOverviewPage() {
  const [totalSchools, activeSchools, totalStudents, totalTeachers, recentSchools] = await Promise.all([
    prisma.school.count(),
    prisma.school.count({ where: { subscriptionStatus: "ACTIVE" } }),
    prisma.student.count(),
    prisma.user.count({ where: { role: "TEACHER" } }),
    prisma.school.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { _count: { select: { users: true, students: true } } },
    }),
  ]);

  const stats = [
    { label: "Schools", value: totalSchools },
    { label: "Active subscriptions", value: activeSchools },
    { label: "Students", value: totalStudents },
    { label: "Teachers", value: totalTeachers },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Platform overview</h1>
        <p className="mt-1 text-sm text-slate-500">A snapshot of every school on SchoolHub.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardBody>
              <p className="text-sm text-slate-500">{stat.label}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{stat.value}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader
          title="Recently added schools"
          action={
            <Link href="/super-admin/schools" className="text-sm font-medium text-indigo-600 hover:underline">
              Manage all schools →
            </Link>
          }
        />
        <CardBody className="overflow-x-auto p-0">
          {recentSchools.length === 0 ? (
            <p className="px-5 py-4 text-sm text-slate-500">No schools yet.</p>
          ) : (
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-slate-100 text-slate-500">
                <tr>
                  <th className="px-5 py-2 font-medium">School</th>
                  <th className="px-5 py-2 font-medium">Passkey</th>
                  <th className="px-5 py-2 font-medium">Plan</th>
                  <th className="px-5 py-2 font-medium">Status</th>
                  <th className="px-5 py-2 font-medium">Users</th>
                  <th className="px-5 py-2 font-medium">Students</th>
                </tr>
              </thead>
              <tbody>
                {recentSchools.map((school) => (
                  <tr key={school.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-5 py-3 font-medium text-slate-900">{school.name}</td>
                    <td className="px-5 py-3 font-mono text-slate-600">{school.passkey}</td>
                    <td className="px-5 py-3 text-slate-600">{school.subscriptionPlan}</td>
                    <td className="px-5 py-3">
                      <Badge tone={statusTone(school.subscriptionStatus)}>{school.subscriptionStatus}</Badge>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{school._count.users}</td>
                    <td className="px-5 py-3 text-slate-600">{school._count.students}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
