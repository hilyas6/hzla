export type Role = "user" | "admin" | "owner";

// Owner can touch anyone but the owner. Admin can only touch plain users —
// never another admin, never the owner — so promotion is one-way: once a
// user becomes admin, only the owner can demote them again.
export function canManageRole(actorRole: Role, targetRole: Role): boolean {
  if (targetRole === "owner") return false;
  if (actorRole === "owner") return true;
  if (actorRole === "admin") return targetRole === "user";
  return false;
}

export function canSetRole(actorRole: Role, targetRole: Role, newRole: Role): boolean {
  if (!canManageRole(actorRole, targetRole)) return false;
  if (actorRole === "admin") return newRole === "admin";
  return true;
}

export function canDeleteUser(actorRole: Role, targetRole: Role): boolean {
  return canManageRole(actorRole, targetRole);
}
