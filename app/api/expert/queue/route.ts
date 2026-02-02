import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getSessionFromRequest } from "../../../../lib/auth";
import { isExpert } from "../../../../lib/rbac";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!isExpert(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const expert = await prisma.expert.findUnique({
    where: { userId: session!.userId },
    include: { skills: true, user: true }
  });

  if (!expert || expert.verificationStatus !== "verified" || expert.user.status !== "active") {
    return NextResponse.json({ error: "Not verified" }, { status: 403 });
  }

  const categoryIds = expert.skills.map((s) => s.categoryId);

  const cases = await prisma.case.findMany({
    where: {
      status: "waiting_for_expert",
      categoryId: { in: categoryIds }
    },
    orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
    include: { category: true, customer: true }
  });

  return NextResponse.json({ cases });
}
