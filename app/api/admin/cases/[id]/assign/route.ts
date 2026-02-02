import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/db";
import { getSessionFromRequest } from "../../../../../../lib/auth";
import { isAdmin } from "../../../../../../lib/rbac";
import { validateCsrf } from "../../../../../../lib/csrf";
import { publishCaseMessage } from "../../../../../../lib/realtime";
import { createNotification } from "../../../../../../lib/notify";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!validateCsrf(req)) return NextResponse.json({ error: "CSRF token invalid" }, { status: 403 });

  const body = await req.json();
  const expertId = body.expertId as string | undefined;
  if (!expertId) return NextResponse.json({ error: "expertId required" }, { status: 400 });

  const expertUser = await prisma.user.findUnique({
    where: { id: expertId },
    include: { expert: true }
  });
  if (!expertUser || expertUser.role !== "expert" || expertUser.expert?.verificationStatus !== "verified") {
    return NextResponse.json({ error: "Expert not verified" }, { status: 400 });
  }

  const updated = await prisma.case.update({
    where: { id: params.id },
    data: {
      assignedExpertId: expertId,
      status: "in_chat"
    }
  });

  await prisma.message.create({
    data: {
      caseId: params.id,
      senderUserId: session.userId,
      type: "system",
      content: "Fall wurde durch Admin neu zugewiesen."
    }
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: session.userId,
      action: "case.assign",
      targetType: "case",
      targetId: params.id,
      metaJson: { expertId }
    }
  });

  await createNotification({
    userId: expertId,
    type: "case.assigned",
    payload: { caseId: params.id }
  });

  publishCaseMessage(params.id, { type: "system", content: "Fall wurde durch Admin neu zugewiesen." });

  return NextResponse.json({ case: updated });
}
