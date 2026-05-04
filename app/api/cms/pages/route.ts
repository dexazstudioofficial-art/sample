import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { audit } from "@/lib/auth";

// GET /api/cms/pages?page=home
export async function GET(req: NextRequest) {
  try {
    const page = req.nextUrl.searchParams.get("page");
    const content = await db.pageContent.findMany({
      where: page ? { page } : undefined,
      orderBy: [{ page: "asc" }, { section: "asc" }, { key: "asc" }],
    });

    const grouped: Record<string, Record<string, Record<string, string>>> = {};
    for (const item of content) {
      if (!grouped[item.page])               grouped[item.page] = {};
      if (!grouped[item.page][item.section]) grouped[item.page][item.section] = {};
      grouped[item.page][item.section][item.key] = item.value;
    }

    return NextResponse.json({ raw: content, grouped });
  } catch (error) {
    console.error("GET /api/cms/pages error:", error);
    return NextResponse.json({ error: "Failed to fetch page content" }, { status: 500 });
  }
}

// PATCH /api/cms/pages  body: { page, section, key, value }[]
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

    const items = body as { page: string; section: string; key: string; value: string }[];
    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "Expected array" }, { status: 400 });
    }

    for (const { page, section, key, value } of items) {
      if (!page || !section || !key) continue;
      await db.pageContent.upsert({
        where:  { page_section_key: { page, section, key } },
        update: { value },
        create: { page, section, key, value, type: "text" },
      });
    }

    await audit(adminId, "UPDATE", "PageContent", undefined, { count: items.length }, ip);
    return NextResponse.json({ ok: true, updated: items.length });
  } catch (error) {
    console.error("PATCH /api/cms/pages error:", error);
    return NextResponse.json({ error: "Failed to save page content" }, { status: 500 });
  }
}
