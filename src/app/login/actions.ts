"use server";

import { AuthError } from "next-auth";
import { signIn, findUserForLogin } from "@/auth";
import { dashboardPathForRole, type Role } from "@/lib/types";

export type LoginActionState = { error?: string };

export async function loginAction(
  _prevState: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {
  const phone = String(formData.get("phone") ?? "").trim();
  const passkey = String(formData.get("passkey") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const callbackUrl = String(formData.get("callbackUrl") ?? "");

  if (!phone || !passkey || !password) {
    return { error: "Please fill in phone number, school passkey, and password." };
  }

  const user = await findUserForLogin(phone, passkey);
  const redirectTo = user?.mustChangePassword
    ? "/change-password"
    : callbackUrl || (user ? dashboardPathForRole(user.role as Role) : "/");

  try {
    await signIn("credentials", { phone, passkey, password, redirectTo });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid phone number, school passkey, or password." };
    }
    throw error;
  }

  return {};
}
