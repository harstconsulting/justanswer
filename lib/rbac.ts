import type { Session } from "./auth";

export function requireRole(session: Session | null, roles: Session["role"][]) {
  if (!session) return false;
  return roles.includes(session.role);
}

export function isAdmin(session: Session | null) {
  return requireRole(session, ["admin", "superadmin"]);
}

export function isExpert(session: Session | null) {
  return requireRole(session, ["expert", "admin", "superadmin"]);
}

export function isCustomer(session: Session | null) {
  return requireRole(session, ["customer", "admin", "superadmin"]);
}
