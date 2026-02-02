import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import { getSessionFromRequest } from "../../../lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const notifications = await prisma.notification.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    take: 30
  });

  const unreadCount = await prisma.notification.count({
    where: { userId: session.userId, readAt: null }
  });

  return NextResponse.json({ notifications, unreadCount });
}
