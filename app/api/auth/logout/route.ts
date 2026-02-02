import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie } from "../../../../lib/auth";
import { validateCsrf } from "../../../../lib/csrf";

export async function POST(req: NextRequest) {
  if (!validateCsrf(req)) return NextResponse.json({ error: "CSRF token invalid" }, { status: 403 });
  clearSessionCookie();
  return NextResponse.json({ ok: true });
}
