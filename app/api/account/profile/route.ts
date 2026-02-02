import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getSessionFromRequest } from "../../../../lib/auth";
import { validateCsrf } from "../../../../lib/csrf";
import { accountProfileSchema } from "../../../../lib/validators";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { profile: true }
  });

  return NextResponse.json({ user });
}

export async function PATCH(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!validateCsrf(req)) return NextResponse.json({ error: "CSRF token invalid" }, { status: 403 });

  const body = await req.json();
  const normalize = (value: unknown) => {
    if (typeof value !== "string") return value;
    const trimmed = value.trim();
    return trimmed.length === 0 ? undefined : trimmed;
  };
  const normalizedBody = {
    name: normalize(body.name),
    phone: normalize(body.phone),
    locale: normalize(body.locale),
    avatarUrl: normalize(body.avatarUrl)
  };

  const parsed = accountProfileSchema.safeParse(normalizedBody);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const updated = await prisma.user.update({
    where: { id: session.userId },
    data: {
      profile: {
        upsert: {
          create: {
            name: parsed.data.name,
            phone: parsed.data.phone ?? undefined,
            locale: parsed.data.locale,
            avatarUrl: parsed.data.avatarUrl ?? undefined
          },
          update: {
            name: parsed.data.name,
            phone: parsed.data.phone ?? undefined,
            locale: parsed.data.locale,
            avatarUrl: parsed.data.avatarUrl ?? undefined
          }
        }
      }
    },
    include: { profile: true }
  });

  return NextResponse.json({ user: updated });
}
