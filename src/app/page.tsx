import Link from "next/link";

const FEATURES = [
  {
    title: "Smart grading engine",
    description:
      "Set a class-score weight once and the system auto-calculates exam weight, scales every raw score, and applies your grade boundaries automatically.",
  },
  {
    title: "Built for every role",
    description:
      "Super Admin, School Admin, Teachers, Form Teachers, and Parents each get a focused portal with exactly the permissions they need.",
  },
  {
    title: "Attendance & fees, handled",
    description:
      "Form Teachers track attendance and fee payments per student, and parents see a live summary without asking the office.",
  },
  {
    title: "One passkey per school",
    description:
      "Every school gets a unique passkey that keeps its students, staff, and records completely separate from every other school on the platform.",
  },
];

const PLANS = [
  {
    name: "Free",
    price: "₵0",
    period: "",
    description: "For small schools getting started.",
    features: ["Up to 2 classes", "Up to 50 students", "Core grading & report cards"],
  },
  {
    name: "Pro",
    price: "₵150",
    period: "/month",
    description: "For growing schools that need more room.",
    features: [
      "Unlimited classes",
      "Unlimited students",
      "Attendance & fee tracking",
      "Priority support",
      "Billed monthly, quarterly, or annually",
    ],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For school groups and large institutions.",
    features: ["Multiple campuses", "Custom onboarding", "Dedicated account manager"],
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <span className="text-xl font-bold text-indigo-600">SchoolHub</span>
          <nav className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Sign in
            </Link>
            <Link
              href="/register/school"
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
            >
              Register your school
            </Link>
          </nav>
        </div>
      </header>

      <section className="bg-gradient-to-b from-indigo-50 to-white px-4 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            School management, simplified.
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            SchoolHub gives your school one platform for grading, attendance, fees, and report
            cards — with auto-scaled scores and a setup that takes minutes, not weeks.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/register/school"
              className="w-full rounded-md bg-indigo-600 px-6 py-3 text-center text-sm font-semibold text-white hover:bg-indigo-500 sm:w-auto"
            >
              Register your school
            </Link>
            <Link
              href="/login"
              className="w-full rounded-md border border-slate-300 bg-white px-6 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:w-auto"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-2xl font-bold text-slate-900">Everything your school needs</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="font-semibold text-slate-900">{feature.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-2xl font-bold text-slate-900">Simple, transparent pricing</h2>
          <p className="mt-2 text-center text-sm text-slate-500">
            Pick a plan that fits your school. Upgrade anytime.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-lg border bg-white p-6 shadow-sm ${
                  plan.highlighted ? "border-indigo-500 ring-1 ring-indigo-500" : "border-slate-200"
                }`}
              >
                <h3 className="font-semibold text-slate-900">{plan.name}</h3>
                <p className="mt-2 text-sm text-slate-500">{plan.description}</p>
                <p className="mt-4">
                  <span className="text-3xl font-bold text-slate-900">{plan.price}</span>
                  <span className="text-sm text-slate-500">{plan.period}</span>
                </p>
                <ul className="mt-4 space-y-2 text-sm text-slate-600">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <span className="mt-0.5 text-indigo-600">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white px-4 py-8">
        <div className="mx-auto max-w-6xl text-center text-sm text-slate-500">
          © {new Date().getFullYear()} SchoolHub. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
