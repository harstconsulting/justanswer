import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getSessionFromRequest } from "../../../../lib/auth";
import { validateCsrf } from "../../../../lib/csrf";
import { expertProfileSchema } from "../../../../lib/validators";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "expert") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      profile: true,
      expert: { include: { skills: true } }
    }
  });

  return NextResponse.json({ user });
}

export async function PATCH(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "expert") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!validateCsrf(req)) return NextResponse.json({ error: "CSRF token invalid" }, { status: 403 });

  const body = await req.json();
  const normalize = (value: unknown) => {
    if (typeof value !== "string") return value;
    const trimmed = value.trim();
    return trimmed.length === 0 ? undefined : trimmed;
  };
  const normalizedBody = {
    bio: normalize(body.bio),
    name: normalize(body.name),
    phone: normalize(body.phone),
    locale: normalize(body.locale),
    avatarUrl: normalize(body.avatarUrl)
  };
  const parsed = expertProfileSchema.safeParse(normalizedBody);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const data = parsed.data;

  const updated = await prisma.user.update({
    where: { id: session.userId },
    data: {
      profile: {
        upsert: {
          create: {
            name: data.name,
            phone: data.phone ?? undefined,
            locale: data.locale,
            avatarUrl: data.avatarUrl ?? undefined
          },
          update: {
            name: data.name,
            phone: data.phone ?? undefined,
            locale: data.locale,
            avatarUrl: data.avatarUrl ?? undefined
          }
        }
      },
      expert: {
        upsert: {
          create: { bio: data.bio },
          update: { bio: data.bio }
        }
      }
    },
    include: { profile: true, expert: { include: { skills: true } } }
  });

  return NextResponse.json({ user: updated });
}
