import { signOut } from "@/auth";

export function SignOutButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/login" });
      }}
    >
      <button type="submit" className="text-sm font-medium text-slate-500 hover:text-slate-900">
        Sign out
      </button>
    </form>
  );
}
