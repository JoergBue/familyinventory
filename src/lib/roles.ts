// Benutzergruppen für Familienmitglieder.
// Als einfache String-Konstanten statt Prisma-Enum gehalten, konsistent mit
// den übrigen "freien" Textfeldern im Schema (z.B. Item.condition).

export const USER_ROLES = ["ADMIN", "FAMILY_MEMBER"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Admin",
  FAMILY_MEMBER: "Familienmitglied",
};

export function isUserRole(value: unknown): value is UserRole {
  return (
    typeof value === "string" &&
    (USER_ROLES as readonly string[]).includes(value)
  );
}
