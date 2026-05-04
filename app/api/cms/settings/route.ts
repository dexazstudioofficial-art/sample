import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { audit } from "@/lib/auth";

const UpdateSchema = z.record(z.string(), z.string());

export async function GET(req: NextRequest) {
  try {
    const group = req.nextUrl.searchParams.get("group");
    const settings = await db.siteSettings.findMany({
      where: group ? { group } : undefined,
      orderBy: [{ group: "asc" }, { key: "asc" }],
    });
    return NextResponse.json(settings);
  } catch (error) {
    console.error("GET /api/cms/settings error:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const adminId = req.headers.get("x-admin-id");
    const ip      = req.headers.get("x-forwarded-for") ?? "unknown";

    if (!adminId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = UpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const updates = parsed.data;
    const results = [];

    for (const [key, value] of Object.entries(updates)) {
      const setting = await db.siteSettings.findUnique({ where: { key } });
      if (!setting) continue;
      const updated = await db.siteSettings.update({ where: { key }, data: { value } });
      results.push(updated);
    }

    await audit(adminId, "UPDATE", "SiteSettings", undefined, { keys: Object.keys(updates) }, ip);
    return NextResponse.json({ ok: true, updated: results.length });
  } catch (error) {
    console.error("PATCH /api/cms/settings error:", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
