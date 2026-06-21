"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { loginAction, type LoginActionState } from "./actions";
import { TextField } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { SUPER_ADMIN_PASSKEY } from "@/lib/types";

const initialState: LoginActionState = {};

export function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "";
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />

      <TextField
        label="Phone number"
        name="phone"
        type="tel"
        autoComplete="tel"
        placeholder="08012345678"
        required
      />
      <TextField
        label="School passkey"
        name="passkey"
        autoComplete="off"
        placeholder={`Your school's passkey, or "${SUPER_ADMIN_PASSKEY}" for platform owner`}
        required
      />
      <TextField
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
      />

      {state.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}

      <Button type="submit" disabled={pending} className="mt-2 w-full">
        {pending ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
