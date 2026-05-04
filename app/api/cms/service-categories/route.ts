import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { audit } from "@/lib/auth";

const Schema = z.object({
  slug:        z.string().min(2, "Slug must be at least 2 characters"),
  name:        z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().default(""),
  icon:        z.string().default(""),
  isActive:    z.boolean().default(true),
  sortOrder:   z.number().int().default(0),
});

export async function GET() {
  try {
    const cats = await db.serviceCategory.findMany({
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { products: true } } },
    });
    return NextResponse.json(cats);
  } catch (error) {
    console.error("GET /api/cms/service-categories error:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
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

    const parsed = Schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const existing = await db.serviceCategory.findUnique({ where: { slug: parsed.data.slug } });
    if (existing) {
      return NextResponse.json({ error: "A category with this slug already exists" }, { status: 409 });
    }

    const cat = await db.serviceCategory.create({ data: parsed.data });
    await audit(adminId, "CREATE", "ServiceCategory", cat.id, { name: cat.name }, ip);

    return NextResponse.json({ ...cat, _count: { products: 0 } }, { status: 201 });
  } catch (error) {
    console.error("POST /api/cms/service-categories error:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
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

    const { id, ...data } = body as { id: string; [k: string]: unknown };
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const existing = await db.serviceCategory.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Category not found" }, { status: 404 });

    const cat = await db.serviceCategory.update({ where: { id }, data });
    await audit(adminId, "UPDATE", "ServiceCategory", id, { name: cat.name }, ip);

    return NextResponse.json({ ok: true, cat });
  } catch (error) {
    console.error("PATCH /api/cms/service-categories error:", error);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
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

    const { id } = body as { id?: string };
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const existing = await db.serviceCategory.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Category not found" }, { status: 404 });

    // Safely unlink products before deleting
    await db.product.updateMany({
      where: { serviceCategoryId: id },
      data:  { serviceCategoryId: null },
    });

    await db.serviceCategory.delete({ where: { id } });
    await audit(adminId, "DELETE", "ServiceCategory", id, { name: existing.name }, ip);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/cms/service-categories error:", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
