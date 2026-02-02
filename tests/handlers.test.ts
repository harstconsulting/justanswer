import { describe, it, expect, vi } from "vitest";

const buildRequest = (body: unknown) =>
  new Request("http://localhost", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

describe("csrf guard", () => {
  it("login returns 403 when csrf missing", async () => {
    vi.resetModules();
    vi.doMock("../lib/csrf", () => ({
      validateCsrf: () => false,
      validateCsrfToken: () => false
    }));
    vi.doMock("../lib/db", () => ({
      prisma: { user: { findUnique: vi.fn() } }
    }));

    const mod = await import("../app/api/auth/login/route");
    const res = await mod.POST(buildRequest({ email: "a@b.com", password: "password123" }) as any);
    expect(res.status).toBe(403);
  });
});

describe("atomic claim", () => {
  it("returns 409 when already claimed", async () => {
    vi.resetModules();
    vi.doMock("../lib/auth", () => ({
      getSessionFromRequest: async () => ({ userId: "expert-1", role: "expert" })
    }));
    vi.doMock("../lib/rbac", () => ({ isExpert: () => true }));
    vi.doMock("../lib/csrf", () => ({
      validateCsrf: () => true,
      validateCsrfToken: () => true
    }));

    vi.doMock("../lib/db", () => ({
      prisma: {
        expert: {
          findUnique: vi.fn().mockResolvedValue({
            id: "exp-1",
            userId: "expert-1",
            verificationStatus: "verified",
            user: { status: "active" }
          })
        },
        $transaction: vi.fn().mockImplementation(async (fn: any) => {
          const tx = {
            case: {
              updateMany: vi.fn().mockResolvedValue({ count: 0 }),
              findUnique: vi.fn().mockResolvedValue(null)
            },
            message: { create: vi.fn().mockResolvedValue({}) }
          };
          return fn(tx);
        })
      }
    }));

    vi.doMock("../lib/realtime", () => ({ publishCaseMessage: () => {} }));
    vi.doMock("../lib/notify", () => ({ notifyCaseClaimed: () => {} }));

    const mod = await import("../app/api/expert/claim/route");
    const res = await mod.POST(buildRequest({ caseId: "case-1" }) as any);
    expect(res.status).toBe(409);
  });
});
