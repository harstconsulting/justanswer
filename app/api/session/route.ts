import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "../../../lib/auth";
import { prisma } from "../../../lib/db";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ session: null });

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { profile: true }
  });

  return NextResponse.json({
    session,
    user: user
      ? {
          id: user.id,
          email: user.email,
          role: user.role,
          profile: user.profile
        }
      : null
  });
}
