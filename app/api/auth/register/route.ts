import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "../../../../lib/db";
import { registerSchema } from "../../../../lib/validators";
import { setSessionCookie } from "../../../../lib/auth";
import { validateCsrf } from "../../../../lib/csrf";
import { rateLimit } from "../../../../lib/rate-limit";

function getClientIp(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || req.ip || "unknown";
}

export async function POST(req: NextRequest) {
  if (!validateCsrf(req)) {
    return NextResponse.json({ error: "CSRF token invalid" }, { status: 403 });
  }

  const ip = getClientIp(req);
  if (!rateLimit({ key: `auth:register:${ip}`, limit: 10, windowMs: 60_000 })) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const body = await req.json();
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { email, password, role } = parsed.data;
  const normalizedEmail = email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      password: passwordHash,
      role,
      status: "active",
      profile: { create: { locale: "de" } },
      expert: role === "expert" ? { create: { verificationStatus: "pending" } } : undefined
    }
  });

  await setSessionCookie({ userId: user.id, role: user.role });

  return NextResponse.json({ ok: true, userId: user.id, role: user.role });
}
