import { requireSession } from "@/lib/session";
import { ChangePasswordForm } from "./ChangePasswordForm";

export default async function ChangePasswordPage() {
  const user = await requireSession();

  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-lg font-semibold text-slate-900">Set a new password</h1>
          <p className="mt-1 text-sm text-slate-500">
            Hi {user.name}, you&apos;re using a default password. Please choose a new one to continue.
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
