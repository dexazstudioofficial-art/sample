import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { audit } from "@/lib/auth";

const Schema = z.object({
  slug:        z.string().min(2),
  name:        z.string().min(2),
  description: z.string().default(""),
  icon:        z.string().default(""),
  isActive:    z.boolean().default(true),
  sortOrder:   z.number().int().default(0),
});

export async function GET() {
  try {
    const cats = await db.serviceCat.findMany({
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { items: true } } },
    });
    return NextResponse.json(cats);
  } catch (err) {
    console.error("GET /api/cms/service-cats:", err);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminId = req.headers.get("x-admin-id");
    const ip      = req.headers.get("x-forwarded-for") ?? "unknown";
    if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body   = await req.json();
    const parsed = Schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });

    const existing = await db.serviceCat.findUnique({ where: { slug: parsed.data.slug } });
    if (existing) return NextResponse.json({ error: "Slug already exists" }, { status: 409 });

    const cat = await db.serviceCat.create({ data: parsed.data });
    await audit(adminId, "CREATE", "ServiceCat", cat.id, { name: cat.name }, ip);
    return NextResponse.json({ ...cat, _count: { items: 0 } }, { status: 201 });
  } catch (err) {
    console.error("POST /api/cms/service-cats:", err);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const adminId = req.headers.get("x-admin-id");
    const ip      = req.headers.get("x-forwarded-for") ?? "unknown";
    if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, ...data } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const cat = await db.serviceCat.update({ where: { id }, data });
    await audit(adminId, "UPDATE", "ServiceCat", id, { name: cat.name }, ip);
    return NextResponse.json({ ok: true, cat });
  } catch (err) {
    console.error("PATCH /api/cms/service-cats:", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const adminId = req.headers.get("x-admin-id");
    const ip      = req.headers.get("x-forwarded-for") ?? "unknown";
    if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const existing = await db.serviceCat.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await db.serviceItem.updateMany({ where: { serviceCatId: id }, data: { serviceCatId: null } });
    await db.serviceCat.delete({ where: { id } });
    await audit(adminId, "DELETE", "ServiceCat", id, { name: existing.name }, ip);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/cms/service-cats:", err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
