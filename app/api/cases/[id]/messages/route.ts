import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { getSessionFromRequest } from "../../../../../lib/auth";
import { messageCreateSchema } from "../../../../../lib/validators";
import { publishCaseMessage } from "../../../../../lib/realtime";
import { canAccessCase } from "../../../../../lib/access";
import { validateCsrf } from "../../../../../lib/csrf";
import { rateLimit } from "../../../../../lib/rate-limit";
import { notifyNewMessage } from "../../../../../lib/notify";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const record = await prisma.case.findUnique({ where: { id: params.id } });
  if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!canAccessCase(session, record)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const messages = await prisma.message.findMany({
    where: { caseId: params.id },
    orderBy: { createdAt: "asc" }
  });

  return NextResponse.json({ messages });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!validateCsrf(req)) return NextResponse.json({ error: "CSRF token invalid" }, { status: 403 });

  const record = await prisma.case.findUnique({ where: { id: params.id } });
  if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!canAccessCase(session, record)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (!rateLimit({ key: `messages:${session.userId}`, limit: 30, windowMs: 60_000 })) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const body = await req.json();
  const parsed = messageCreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const created = await prisma.message.create({
    data: {
      caseId: params.id,
      senderUserId: session.userId,
      type: parsed.data.type,
      content: parsed.data.content
    }
  });

  publishCaseMessage(params.id, created);

  const recipientId =
    session.role === "customer" ? record.assignedExpertId : record.customerId;
  if (recipientId) {
    await notifyNewMessage(params.id, recipientId, session.role);
  }

  return NextResponse.json({ message: created });
}
