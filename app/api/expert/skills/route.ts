import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getSessionFromRequest } from "../../../../lib/auth";
import { validateCsrf } from "../../../../lib/csrf";
import { expertSkillsSchema } from "../../../../lib/validators";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "expert") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const skills = await prisma.expertSkill.findMany({
    where: { expert: { userId: session.userId } },
    include: { category: true }
  });

  return NextResponse.json({ skills });
}

export async function PUT(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "expert") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!validateCsrf(req)) return NextResponse.json({ error: "CSRF token invalid" }, { status: 403 });

  const body = await req.json();
  const parsed = expertSkillsSchema.safeParse(body.skills ?? body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const expert = await prisma.expert.findUnique({ where: { userId: session.userId } });
  if (!expert) return NextResponse.json({ error: "Expert profile missing" }, { status: 400 });

  await prisma.$transaction(async (tx) => {
    await tx.expertSkill.deleteMany({ where: { expertId: expert.id } });
    if (parsed.data.length > 0) {
      await tx.expertSkill.createMany({
        data: parsed.data.map((skill) => ({
          expertId: expert.id,
          categoryId: skill.categoryId,
          proficiencyLevel: skill.proficiencyLevel
        }))
      });
    }
  });

  const skills = await prisma.expertSkill.findMany({
    where: { expertId: expert.id },
    include: { category: true }
  });

  return NextResponse.json({ skills });
}
