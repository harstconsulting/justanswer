import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getSessionFromRequest } from "../../../../lib/auth";
import { isAdmin } from "../../../../lib/rbac";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const experts = await prisma.expert.findMany({
    include: {
      user: { include: { profile: true } },
      skills: true,
      documents: true
    },
    orderBy: { user: { createdAt: "desc" } }
  });

  return NextResponse.json({ experts });
}
