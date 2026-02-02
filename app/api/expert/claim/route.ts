import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getSessionFromRequest } from "../../../../lib/auth";
import { isExpert } from "../../../../lib/rbac";
import { publishCaseMessage } from "../../../../lib/realtime";
import { validateCsrf } from "../../../../lib/csrf";
import { notifyCaseClaimed } from "../../../../lib/notify";

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isExpert(session) || session.role !== "expert") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!validateCsrf(req)) return NextResponse.json({ error: "CSRF token invalid" }, { status: 403 });

  const expert = await prisma.expert.findUnique({
    where: { userId: session.userId },
    include: { user: true }
  });
  if (!expert || expert.verificationStatus !== "verified" || expert.user.status !== "active") {
    return NextResponse.json({ error: "Not verified" }, { status: 403 });
  }

  const body = await req.json();
  const caseId = body.caseId as string | undefined;
  if (!caseId) return NextResponse.json({ error: "caseId required" }, { status: 400 });

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.case.updateMany({
      where: {
        id: caseId,
        assignedExpertId: null,
        status: { in: ["open", "waiting_for_expert"] }
      },
      data: { assignedExpertId: session.userId, status: "in_chat" }
    });

    if (updated.count === 0) return null;

    await tx.message.create({
      data: {
        caseId,
        senderUserId: session.userId,
        type: "system",
        content: "Experte verbunden."
      }
    });

    return tx.case.findUnique({ where: { id: caseId } });
  });

  if (!result) {
    return NextResponse.json({ error: "Case already claimed" }, { status: 409 });
  }

  publishCaseMessage(caseId, { type: "system", content: "Experte verbunden." });
  await notifyCaseClaimed(caseId, result.customerId, session.userId);

  return NextResponse.json({ case: result });
}
