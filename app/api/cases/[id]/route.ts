import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getSessionFromRequest } from "../../../../lib/auth";
import { isAdmin } from "../../../../lib/rbac";
import { canAccessCase } from "../../../../lib/access";
import { validateCsrf } from "../../../../lib/csrf";
import { notifyCaseClosed } from "../../../../lib/notify";

async function loadCase(id: string) {
  return prisma.case.findUnique({
    where: { id },
    include: { category: true, assignedExpert: true }
  });
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const record = await loadCase(params.id);
  if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!canAccessCase(session, record)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  return NextResponse.json({ case: record });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!validateCsrf(req)) return NextResponse.json({ error: "CSRF token invalid" }, { status: 403 });

  const record = await loadCase(params.id);
  if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!canAccessCase(session, record)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const status = body.status as string | undefined;

  if (!status) return NextResponse.json({ error: "Status required" }, { status: 400 });

  const updated = await prisma.case.update({
    where: { id: params.id },
    data: {
      status: status as any,
      closedAt: status === "closed" ? new Date() : undefined
    }
  });

  if (isAdmin(session)) {
    await prisma.auditLog.create({
      data: {
        actorUserId: session.userId,
        action: "case.update",
        targetType: "case",
        targetId: params.id,
        metaJson: { status }
      }
    });
  }

  if (status === "closed" && updated.assignedExpertId) {
    await notifyCaseClosed(updated.id, updated.assignedExpertId);
  }

  return NextResponse.json({ case: updated });
}
