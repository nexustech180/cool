import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ passwordChanged?: string }>;
}) {
  const { passwordChanged } = await searchParams;

  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <Link href="/" className="text-xl font-bold text-indigo-600">
            SchoolHub
          </Link>
          <h1 className="mt-2 text-lg font-semibold text-slate-900">Sign in to your account</h1>
          <p className="mt-1 text-sm text-slate-500">
            Every role signs in here with phone number, school passkey, and password.
          </p>
        </div>
        {passwordChanged && (
          <p className="mb-4 rounded-md bg-green-50 px-3 py-2 text-center text-sm text-green-700">
            Password updated. Please sign in again.
          </p>
        )}
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
        <p className="mt-4 text-center text-sm text-slate-500">
          New school?{" "}
          <Link href="/register/school" className="font-medium text-indigo-600 hover:underline">
            Register your school
          </Link>
        </p>
        <p className="mt-2 text-center text-sm text-slate-500">
          Parent of a student?{" "}
          <Link href="/register/parent" className="font-medium text-indigo-600 hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
