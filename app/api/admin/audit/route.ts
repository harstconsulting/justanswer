import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getSessionFromRequest } from "../../../../lib/auth";
import { isAdmin } from "../../../../lib/rbac";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const actor = searchParams.get("actor");
  const action = searchParams.get("action");
  const targetType = searchParams.get("target_type");

  const logs = await prisma.auditLog.findMany({
    where: {
      actorUserId: actor ?? undefined,
      action: action ?? undefined,
      targetType: targetType ?? undefined
    },
    orderBy: { createdAt: "desc" },
    take: 100
  });

  return NextResponse.json({ logs });
}
