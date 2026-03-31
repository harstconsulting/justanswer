import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getSessionFromRequest } from "../../../../lib/auth";
import { validateCsrf } from "../../../../lib/csrf";
import { verificationDocumentSchema } from "../../../../lib/validators";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "expert") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const expert = await prisma.expert.findUnique({ where: { userId: session.userId } });
  if (!expert) return NextResponse.json({ error: "Expert profile missing" }, { status: 400 });

  const documents = await prisma.verificationDocument.findMany({
    where: { expertId: expert.id },
    orderBy: { reviewedAt: "desc" }
  });

  return NextResponse.json({ documents, verificationStatus: expert.verificationStatus });
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "expert") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!validateCsrf(req)) return NextResponse.json({ error: "CSRF token invalid" }, { status: 403 });

  const body = await req.json();
  const parsed = verificationDocumentSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const expert = await prisma.expert.findUnique({ where: { userId: session.userId } });
  if (!expert) return NextResponse.json({ error: "Expert profile missing" }, { status: 400 });

  const created = await prisma.verificationDocument.create({
    data: {
      expertId: expert.id,
      fileUrl: parsed.data.fileUrl,
      status: "pending"
    }
  });

  return NextResponse.json({ document: created });
}
