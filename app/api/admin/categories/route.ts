import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getSessionFromRequest } from "../../../../lib/auth";
import { isAdmin } from "../../../../lib/rbac";
import { validateCsrf } from "../../../../lib/csrf";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({ categories });
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!validateCsrf(req)) return NextResponse.json({ error: "CSRF token invalid" }, { status: 403 });

  const body = await req.json();
  const name = body.name as string | undefined;
  const parentId = body.parentId as string | undefined;
  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const created = await prisma.category.create({
    data: { name, parentId: parentId ?? null }
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: session!.userId,
      action: "category.create",
      targetType: "category",
      targetId: created.id,
      metaJson: { name }
    }
  });

  return NextResponse.json({ category: created });
}

export async function PATCH(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!validateCsrf(req)) return NextResponse.json({ error: "CSRF token invalid" }, { status: 403 });

  const body = await req.json();
  const id = body.id as string | undefined;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const updated = await prisma.category.update({
    where: { id },
    data: {
      name: body.name ?? undefined,
      parentId: body.parentId ?? undefined,
      isActive: body.isActive ?? undefined
    }
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: session.userId,
      action: "category.update",
      targetType: "category",
      targetId: id,
      metaJson: { name: body.name, parentId: body.parentId, isActive: body.isActive }
    }
  });

  return NextResponse.json({ category: updated });
}
