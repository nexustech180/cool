"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerSchoolAction, type RegisterSchoolState } from "./actions";
import { TextField } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

const initialState: RegisterSchoolState = {};

export function RegisterSchoolForm() {
  const [state, formAction, pending] = useActionState(registerSchoolAction, initialState);

  if (state.success) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{state.success.schoolName} is ready!</h2>
          <p className="mt-1 text-sm text-slate-500">
            Share this passkey with your staff and parents — they&apos;ll need it to sign in.
          </p>
        </div>
        <div className="rounded-md bg-indigo-50 px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-indigo-500">School passkey</p>
          <p className="mt-1 text-2xl font-bold tracking-widest text-indigo-700">
            {state.success.passkey}
          </p>
        </div>
        <p className="text-xs text-slate-500">
          Write this down now — you&apos;ll need it every time you or your staff sign in.
        </p>
        <Link
          href="/school-admin"
          className="mt-2 inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Continue to dashboard
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <TextField label="School name" name="schoolName" placeholder="Sunrise Academy" required />
      <TextField label="Your name" name="adminName" placeholder="Full name" required />
      <TextField
        label="Your phone number"
        name="adminPhone"
        type="tel"
        autoComplete="tel"
        placeholder="08012345678"
        required
      />
      <TextField
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        minLength={6}
        required
      />
      <TextField
        label="Confirm password"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        minLength={6}
        required
      />

      {state.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}

      <Button type="submit" disabled={pending} className="mt-2 w-full">
        {pending ? "Creating school..." : "Create school"}
      </Button>
    </form>
  );
}
