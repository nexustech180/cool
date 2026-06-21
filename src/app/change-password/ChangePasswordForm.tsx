"use client";

import { useActionState } from "react";
import { changePasswordAction, type ChangePasswordState } from "./actions";
import { TextField } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

const initialState: ChangePasswordState = {};

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(changePasswordAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <TextField
        label="New password"
        name="newPassword"
        type="password"
        autoComplete="new-password"
        minLength={6}
        required
      />
      <TextField
        label="Confirm new password"
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
        {pending ? "Updating..." : "Update password"}
      </Button>
    </form>
  );
}
