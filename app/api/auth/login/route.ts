import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "../../../../lib/db";
import { loginSchema } from "../../../../lib/validators";
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
  if (!rateLimit({ key: `auth:login:${ip}`, limit: 10, windowMs: 60_000 })) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const body = await req.json();
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { email, password } = parsed.data;
  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() }
  });

  await setSessionCookie({ userId: user.id, role: user.role });

  return NextResponse.json({ ok: true, userId: user.id, role: user.role });
}
