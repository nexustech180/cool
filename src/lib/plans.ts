export type PlanId = "FREE" | "PRO" | "ENTERPRISE";

export type Plan = {
  id: PlanId;
  label: string;
  priceNaira: number;
  features: string[];
};

export const PLANS: Plan[] = [
  {
    id: "FREE",
    label: "Free",
    priceNaira: 0,
    features: ["Up to 2 classes", "Up to 50 students", "Basic report cards"],
  },
  {
    id: "PRO",
    label: "Pro",
    priceNaira: 15000,
    features: ["Unlimited classes & students", "Full report cards", "Attendance tracking", "Fee management", "Paystack payments"],
  },
  {
    id: "ENTERPRISE",
    label: "Enterprise",
    priceNaira: 50000,
    features: ["Everything in Pro", "Priority support", "Custom branding", "Data exports"],
  },
];

export function getPlan(id: string): Plan {
  return PLANS.find((p) => p.id === id) ?? PLANS[0];
}
