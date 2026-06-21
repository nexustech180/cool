import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { TextField } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { RegisterParentForm } from "./RegisterParentForm";

export default async function RegisterParentPage({
  searchParams,
}: {
  searchParams: Promise<{ school?: string }>;
}) {
  const { school: schoolParam } = await searchParams;
  const trimmedPasskey = schoolParam?.trim();

  const school = trimmedPasskey
    ? await prisma.school.findUnique({ where: { passkey: trimmedPasskey.toUpperCase() } })
    : null;

  const classes = school
    ? await prisma.class.findMany({ where: { schoolId: school.id }, orderBy: { name: "asc" } })
    : [];

  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <Link href="/" className="text-xl font-bold text-indigo-600">
            SchoolHub
          </Link>
          <h1 className="mt-2 text-lg font-semibold text-slate-900">Parent registration</h1>
          <p className="mt-1 text-sm text-slate-500">
            {school ? `Register to view ${school.name} report cards, attendance, and fees.` : "Enter your school's passkey to get started."}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          {!school ? (
            <form className="flex flex-col gap-4">
              <TextField
                label="School passkey"
                name="school"
                autoComplete="off"
                defaultValue={trimmedPasskey}
                placeholder="Ask your school for this"
                required
              />
              {trimmedPasskey && (
                <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                  We couldn&apos;t find a school with that passkey.
                </p>
              )}
              <Button type="submit" className="mt-2 w-full">
                Continue
              </Button>
            </form>
          ) : classes.length === 0 ? (
            <p className="text-sm text-slate-500">
              Your school hasn&apos;t set up any classes yet. Please contact {school.name} before registering.
            </p>
          ) : (
            <RegisterParentForm schoolId={school.id} passkey={school.passkey} classes={classes} />
          )}
        </div>
        <p className="mt-4 text-center text-sm text-slate-500">
          Already registered?{" "}
          <Link href="/login" className="font-medium text-indigo-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
