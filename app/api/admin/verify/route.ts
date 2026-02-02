import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getSessionFromRequest } from "../../../../lib/auth";
import { isAdmin } from "../../../../lib/rbac";
import { validateCsrf } from "../../../../lib/csrf";

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!validateCsrf(req)) return NextResponse.json({ error: "CSRF token invalid" }, { status: 403 });

  const body = await req.json();
  const expertId = body.expertId as string | undefined;
  const status = body.status as string | undefined;
  if (!expertId || !status) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  if (!["pending", "verified", "rejected", "suspended"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const updated = await prisma.expert.update({
    where: { id: expertId },
    data: { verificationStatus: status as any }
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: session!.userId,
      action: "expert.verify",
      targetType: "expert",
      targetId: expertId,
      metaJson: { status }
    }
  });

  return NextResponse.json({ expert: updated });
}
