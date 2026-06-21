"use client";

import { useActionState } from "react";
import { registerParentAction, type RegisterParentState } from "./actions";
import { TextField, SelectField } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

const initialState: RegisterParentState = {};

export function RegisterParentForm({
  schoolId,
  passkey,
  classes,
}: {
  schoolId: string;
  passkey: string;
  classes: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(registerParentAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="schoolId" value={schoolId} />

      <TextField id="passkeyDisplay" label="School passkey" value={passkey} disabled />

      <TextField
        label="Your phone number"
        name="phone"
        type="tel"
        autoComplete="tel"
        placeholder="08012345678"
        required
      />
      <TextField label="Your name" name="parentName" placeholder="Full name" required />
      <TextField label="Child's full name" name="childFullName" placeholder="Full name" required />

      <SelectField label="Child's class" name="classId" defaultValue="" required>
        <option value="" disabled>
          Select a class
        </option>
        {classes.map((klass) => (
          <option key={klass.id} value={klass.id}>
            {klass.name}
          </option>
        ))}
      </SelectField>

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
        {pending ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
}
