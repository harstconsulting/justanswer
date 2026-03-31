import { NextRequest, NextResponse } from "next/server";
import { CaseStatus } from "@prisma/client";
import { prisma } from "../../../../lib/db";
import { getSessionFromRequest } from "../../../../lib/auth";
import { isAdmin } from "../../../../lib/rbac";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const statusParam = searchParams.get("status");
  const categoryId = searchParams.get("categoryId");
  const assignedExpertId = searchParams.get("assignedExpertId");

  const status = statusParam && (Object.values(CaseStatus) as string[]).includes(statusParam)
    ? (statusParam as CaseStatus)
    : undefined;

  const cases = await prisma.case.findMany({
    where: {
      status,
      categoryId: categoryId ?? undefined,
      assignedExpertId: assignedExpertId ?? undefined
    },
    include: { category: true, customer: true, assignedExpert: true },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ cases });
}
