import { NextRequest } from "next/server";
import { getSessionFromRequest } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/db";
import { subscribeCaseMessages } from "../../../../../lib/realtime";
import { canAccessCase } from "../../../../../lib/access";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const record = await prisma.case.findUnique({ where: { id: params.id } });
  if (!record) return new Response("Not found", { status: 404 });

  if (!canAccessCase(session, record)) return new Response("Forbidden", { status: 403 });

  const stream = new ReadableStream({
    start(controller) {
      const send = (payload: unknown) => {
        controller.enqueue(`data: ${JSON.stringify(payload)}\n\n`);
      };
      const unsubscribe = subscribeCaseMessages(params.id, send);
      send({ type: "system", content: "stream-start" });

      req.signal.addEventListener("abort", () => {
        unsubscribe();
        controller.close();
      });
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive"
    }
  });
}
