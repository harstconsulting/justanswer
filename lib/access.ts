import type { Session } from "./auth";

type CaseRecord = {
  customerId: string;
  assignedExpertId: string | null;
};

export function canAccessCase(session: Session, record: CaseRecord) {
  if (session.role === "customer") return record.customerId === session.userId;
  if (session.role === "expert") return record.assignedExpertId === session.userId;
  return session.role === "admin" || session.role === "superadmin";
}
