import { describe, it, expect } from "vitest";
import { canAccessCase } from "../lib/access";

describe("case access", () => {
  it("customer cannot read other case", () => {
    const session = { userId: "user-1", role: "customer" as const };
    const record = { customerId: "user-2", assignedExpertId: null };
    expect(canAccessCase(session, record)).toBe(false);
  });

  it("expert cannot read unassigned case", () => {
    const session = { userId: "expert-1", role: "expert" as const };
    const record = { customerId: "user-1", assignedExpertId: null };
    expect(canAccessCase(session, record)).toBe(false);
  });

  it("expert can read assigned case", () => {
    const session = { userId: "expert-1", role: "expert" as const };
    const record = { customerId: "user-1", assignedExpertId: "expert-1" };
    expect(canAccessCase(session, record)).toBe(true);
  });

  it("admin can read any case", () => {
    const session = { userId: "admin-1", role: "admin" as const };
    const record = { customerId: "user-1", assignedExpertId: null };
    expect(canAccessCase(session, record)).toBe(true);
  });
});
