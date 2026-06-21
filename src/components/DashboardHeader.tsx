import Link from "next/link";
import { SignOutButton } from "./SignOutButton";

type NavLink = { href: string; label: string };

export function DashboardHeader({
  roleLabel,
  userName,
  schoolName,
  navLinks,
}: {
  roleLabel: string;
  userName: string;
  schoolName?: string;
  navLinks: NavLink[];
}) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-lg font-bold text-indigo-600">
            SchoolHub
          </Link>
          {schoolName && <span className="text-sm text-slate-400">/ {schoolName}</span>}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-500">
            {userName} · <span className="font-medium text-slate-700">{roleLabel}</span>
          </span>
          <SignOutButton />
        </div>
      </div>
      {navLinks.length > 0 && (
        <nav className="mx-auto flex max-w-6xl gap-4 px-4 pb-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-600 hover:text-indigo-600"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
