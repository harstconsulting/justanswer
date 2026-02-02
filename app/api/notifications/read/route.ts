import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getSessionFromRequest } from "../../../../lib/auth";
import { validateCsrf } from "../../../../lib/csrf";

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!validateCsrf(req)) return NextResponse.json({ error: "CSRF token invalid" }, { status: 403 });

  const body = await req.json();
  const ids = (body.ids as string[] | undefined) ?? [];

  if (ids.length === 0) {
    await prisma.notification.updateMany({
      where: { userId: session.userId, readAt: null },
      data: { readAt: new Date() }
    });
  } else {
    await prisma.notification.updateMany({
      where: { userId: session.userId, id: { in: ids } },
      data: { readAt: new Date() }
    });
  }

  return NextResponse.json({ ok: true });
}
