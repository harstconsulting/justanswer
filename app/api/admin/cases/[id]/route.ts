import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { getSessionFromRequest } from "../../../../../lib/auth";
import { isAdmin } from "../../../../../lib/rbac";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const record = await prisma.case.findUnique({
    where: { id: params.id },
    include: {
      category: true,
      customer: true,
      assignedExpert: true,
      messages: { orderBy: { createdAt: "asc" } }
    }
  });

  if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ case: record });
}
