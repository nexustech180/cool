export const ROLES = ["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER", "PARENT"] as const;
export type Role = (typeof ROLES)[number];

export const SUBSCRIPTION_STATUSES = ["TRIAL", "ACTIVE", "SUSPENDED"] as const;
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

export const SUBSCRIPTION_INTERVALS = ["MONTHLY", "QUARTERLY", "ANNUALLY"] as const;
export type SubscriptionInterval = (typeof SUBSCRIPTION_INTERVALS)[number];

export function subscriptionIntervalLabel(interval: SubscriptionInterval): string {
  switch (interval) {
    case "MONTHLY":
      return "Monthly";
    case "QUARTERLY":
      return "Quarterly (3 months)";
    case "ANNUALLY":
      return "Annually";
  }
}

export const SUPER_ADMIN_PASSKEY = "admin";

export function roleLabel(role: Role): string {
  switch (role) {
    case "SUPER_ADMIN":
      return "Super Admin";
    case "SCHOOL_ADMIN":
      return "School Admin";
    case "TEACHER":
      return "Teacher";
    case "PARENT":
      return "Parent";
  }
}

export function dashboardPathForRole(role: Role): string {
  switch (role) {
    case "SUPER_ADMIN":
      return "/super-admin";
    case "SCHOOL_ADMIN":
      return "/school-admin";
    case "TEACHER":
      return "/teacher";
    case "PARENT":
      return "/parent";
  }
}
