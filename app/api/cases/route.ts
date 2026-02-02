import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import { getSessionFromRequest } from "../../../lib/auth";
import { caseCreateSchema } from "../../../lib/validators";
import { publishCaseMessage } from "../../../lib/realtime";
import { isCustomer } from "../../../lib/rbac";
import { validateCsrf } from "../../../lib/csrf";
import { notifyMatchingExperts } from "../../../lib/notify";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let where = {} as Record<string, unknown>;
  if (session.role === "customer") {
    where = { customerId: session.userId };
  } else if (session.role === "expert") {
    where = { assignedExpertId: session.userId };
  }

  const cases = await prisma.case.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { category: true, assignedExpert: true }
  });

  return NextResponse.json({ cases });
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isCustomer(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!validateCsrf(req)) {
    return NextResponse.json({ error: "CSRF token invalid" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = caseCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { categoryId, title, description, priority } = parsed.data;

  const created = await prisma.case.create({
    data: {
      customerId: session.userId,
      categoryId,
      title,
      description,
      priority,
      status: "waiting_for_expert"
    }
  });

  await prisma.message.create({
    data: {
      caseId: created.id,
      senderUserId: session.userId,
      type: "system",
      content: "Fall erstellt. Matching gestartet."
    }
  });

  publishCaseMessage(created.id, { type: "system", content: "Fall erstellt. Matching gestartet." });
  await notifyMatchingExperts(created.id, categoryId);

  return NextResponse.json({ caseId: created.id });
}
