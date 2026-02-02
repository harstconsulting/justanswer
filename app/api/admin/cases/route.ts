import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getSessionFromRequest } from "../../../../lib/auth";
import { isAdmin } from "../../../../lib/rbac";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const categoryId = searchParams.get("categoryId");
  const assignedExpertId = searchParams.get("assignedExpertId");

  const cases = await prisma.case.findMany({
    where: {
      status: status ?? undefined,
      categoryId: categoryId ?? undefined,
      assignedExpertId: assignedExpertId ?? undefined
    },
    include: { category: true, customer: true, assignedExpert: true },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ cases });
}
