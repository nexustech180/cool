import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge, feeStatusTone } from "@/components/ui/Badge";
import { TermPicker } from "@/components/TermPicker";
import { getFeeStatus } from "@/lib/grading";
import { PayNowForm } from "./PayNowForm";

export default async function ParentFeesPage({
  params,
  searchParams,
}: {
  params: Promise<{ studentId: string }>;
  searchParams: Promise<{ termId?: string; ref?: string }>;
}) {
  const user = await requireRole("PARENT");
  const schoolId = user.schoolId!;
  const { studentId } = await params;
  const { termId: termIdParam, ref } = await searchParams;

  const student = await prisma.student.findFirst({
    where: { id: studentId, schoolId, parentId: user.id },
    include: { class: true },
  });
  if (!student) notFound();

  // Show payment result banner after returning from Paystack callback
  let paymentBanner: "success" | "pending" | null = null;
  if (ref) {
    const payment = await prisma.payment.findUnique({ where: { paystackRef: ref } });
    if (payment) paymentBanner = payment.status === "success" ? "success" : "pending";
  }

  const header = (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Fees</h1>
        <p className="mt-1 text-sm text-slate-500">
          {student.fullName} — {student.class.name}
        </p>
      </div>
      <Link href="/parent" className="text-sm font-medium text-indigo-600 hover:underline">
        ← My children
      </Link>
    </div>
  );

  const terms = await prisma.term.findMany({ where: { schoolId }, orderBy: { startDate: "desc" } });
  if (terms.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        {header}
        <Card>
          <CardBody>
            <p className="text-sm text-slate-500">No terms have been set up yet.</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  const activeTerm = terms.find((t) => t.isActive);
  const selectedTerm = terms.find((t) => t.id === termIdParam) ?? activeTerm ?? terms[0];

  const fee = await prisma.fee.findFirst({
    where: { studentId: student.id, termId: selectedTerm.id },
  });

  const status = fee ? getFeeStatus(fee.amountDue, fee.amountPaid) : null;
  const balance = fee ? fee.amountDue - fee.amountPaid : null;

  return (
    <div className="flex flex-col gap-6">
      {header}

      {paymentBanner === "success" && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          Payment received — thank you! Your balance will update shortly if not already reflected.
        </div>
      )}
      {paymentBanner === "pending" && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Payment is being processed. Your balance will update once confirmed.
        </div>
      )}

      {terms.length > 1 && (
        <Card>
          <CardBody>
            <TermPicker terms={terms} termId={selectedTerm.id} basePath={`/parent/fees/${student.id}`} />
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader title={selectedTerm.name} />
        <CardBody>
          {!fee ? (
            <p className="text-sm text-slate-500">No fee record for this term yet.</p>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-slate-200 p-4">
                  <p className="text-xs font-medium uppercase text-slate-500">Amount due</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">₦{fee.amountDue.toLocaleString()}</p>
                </div>
                <div className="rounded-lg border border-slate-200 p-4">
                  <p className="text-xs font-medium uppercase text-slate-500">Amount paid</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">₦{fee.amountPaid.toLocaleString()}</p>
                </div>
                <div className="rounded-lg border border-slate-200 p-4">
                  <p className="text-xs font-medium uppercase text-slate-500">Balance</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">₦{balance!.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-700">Status:</span>
                <Badge tone={feeStatusTone(status!)}>{status}</Badge>
                {fee.dueDate && (
                  <span className="text-sm text-slate-500">
                    Due {new Date(fee.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>
              {balance! > 0 && <PayNowForm feeId={fee.id} balance={balance!} />}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
