import Link from "next/link";
import { RegisterSchoolForm } from "./RegisterSchoolForm";

export default function RegisterSchoolPage() {
  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <Link href="/" className="text-xl font-bold text-indigo-600">
            SchoolHub
          </Link>
          <h1 className="mt-2 text-lg font-semibold text-slate-900">Register your school</h1>
          <p className="mt-1 text-sm text-slate-500">
            You&apos;ll be the School Admin. We&apos;ll generate a unique passkey for your school.
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <RegisterSchoolForm />
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
