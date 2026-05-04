import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { audit } from "@/lib/auth";

export const runtime = "nodejs";

// GET /api/cms/media?folder=general
export async function GET(req: NextRequest) {
  try {
    const folder = req.nextUrl.searchParams.get("folder");
    const media = await db.media.findMany({
      where:   folder ? { folder } : undefined,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(media);
  } catch (err) {
    console.error("GET /api/cms/media:", err);
    return NextResponse.json({ error: "Failed to fetch media" }, { status: 500 });
  }
}

// DELETE /api/cms/media
export async function DELETE(req: NextRequest) {
  try {
    const adminId = req.headers.get("x-admin-id");
    const ip      = req.headers.get("x-forwarded-for") ?? "unknown";
    if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const media = await db.media.findUnique({ where: { id } });
    if (!media) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await db.media.delete({ where: { id } });
    await audit(adminId, "DELETE", "Media", id, { filename: media.filename }, ip);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/cms/media:", err);
    return NextResponse.json({ error: "Failed to delete media" }, { status: 500 });
  }
}
