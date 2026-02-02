import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "../../../lib/auth";
import { validateCsrf } from "../../../lib/csrf";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!validateCsrf(req)) return NextResponse.json({ error: "CSRF token invalid" }, { status: 403 });

  const contentType = req.headers.get("content-type") || "";
  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const file = form.get("file");
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "file required" }, { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });
    const originalName = typeof (file as any).name === "string" ? (file as any).name : "upload.bin";
    const safeName = `${randomUUID()}-${originalName}`.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = path.join(uploadsDir, safeName);

    const arrayBuffer = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(arrayBuffer));

    const fileUrl = `/uploads/${safeName}`;
    return NextResponse.json({ fileUrl });
  }

  const body = await req.json();
  const filename = body.filename as string | undefined;
  if (!filename) return NextResponse.json({ error: "filename required" }, { status: 400 });

  const base = process.env.UPLOAD_BASE_URL || "http://localhost:3000/uploads";
  const fileUrl = `${base}/${encodeURIComponent(filename)}`;

  return NextResponse.json({ uploadUrl: fileUrl, fileUrl });
}
