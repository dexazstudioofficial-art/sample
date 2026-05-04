import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { audit } from "@/lib/auth";

const UpdateSchema = z.object({
  slug:              z.string().min(2).optional(),
  name:              z.string().min(2).optional(),
  category:          z.string().min(1).optional(),
  subCategory:       z.string().optional(),
  serviceCategoryId: z.string().min(1).nullable().optional(),
  description:       z.string().optional(),
  tagline:           z.string().optional(),
  heroImage:         z.string().url().or(z.literal("")).optional(),
  image:             z.string().url().or(z.literal("")).optional(),
  specs:             z.array(z.object({ label: z.string(), value: z.string() })).optional(),
  features:          z.array(z.string()).optional(),
  tags:              z.array(z.string()).optional(),
  whyPoints:         z.array(z.object({ number: z.string(), title: z.string(), desc: z.string() })).optional(),
  relatedLinks:      z.array(z.object({ href: z.string(), label: z.string() })).optional(),
  variants:          z.array(z.object({ name: z.string(), image: z.string().default(""), tags: z.array(z.string()).default([]), description: z.string().default("") })).optional(),
  metaTitle:         z.string().optional(),
  metaDesc:          z.string().optional(),
  isActive:          z.boolean().optional(),
  sortOrder:         z.number().int().optional(),
});

function parseJsonField<T>(val: string, fallback: T): T {
  try { return val ? JSON.parse(val) : fallback; } catch { return fallback; }
}

function serialize(p: {
  specs: string; features: string; tags: string;
  whyPoints: string; relatedLinks: string; variants: string;
  serviceCategory?: { id: string; name: string; slug: string } | null;
  [key: string]: unknown;
}) {
  return {
    ...p,
    specs:        parseJsonField(p.specs, []),
    features:     parseJsonField(p.features, []),
    tags:         parseJsonField(p.tags, []),
    whyPoints:    parseJsonField(p.whyPoints, []),
    relatedLinks: parseJsonField(p.relatedLinks, []),
    variants:     parseJsonField(p.variants, []),
  };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const product = await db.product.findUnique({
      where:   { id },
      include: { serviceCategory: { select: { id: true, name: true, slug: true } } },
    });
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(serialize(product));
  } catch (err) {
    console.error("GET /api/cms/products/[id]:", err);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const adminId = req.headers.get("x-admin-id");
    const ip      = req.headers.get("x-forwarded-for") ?? "unknown";
    if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const existing = await db.product.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    let body: unknown;
    try { body = await req.json(); } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = UpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const { specs, features, tags, whyPoints, relatedLinks, variants, slug, ...rest } = parsed.data;
    const data: Record<string, unknown> = { ...rest };

    // Handle slug change — create redirect if slug changed
    if (slug && slug !== existing.slug) {
      const slugTaken = await db.product.findUnique({ where: { slug } });
      if (slugTaken) return NextResponse.json({ error: "Slug already in use by another product" }, { status: 409 });
      data.slug = slug;
      // Create redirect: old slug → new slug
      await db.slugRedirect.upsert({
        where:  { oldSlug: existing.slug },
        update: { newSlug: slug },
        create: { oldSlug: existing.slug, newSlug: slug, entity: "product" },
      });
    }

    if (specs !== undefined)        data.specs        = JSON.stringify(specs);
    if (features !== undefined)     data.features     = JSON.stringify(features);
    if (tags !== undefined)         data.tags         = JSON.stringify(tags);
    if (whyPoints !== undefined)    data.whyPoints    = JSON.stringify(whyPoints);
    if (relatedLinks !== undefined) data.relatedLinks = JSON.stringify(relatedLinks);
    if (variants !== undefined)     data.variants     = JSON.stringify(variants);

    const product = await db.product.update({
      where:   { id },
      data,
      include: { serviceCategory: { select: { id: true, name: true, slug: true } } },
    });

    await audit(adminId, "UPDATE", "Product", id, { name: product.name }, ip);
    return NextResponse.json({ ok: true, product: serialize(product) });
  } catch (err) {
    console.error("PATCH /api/cms/products/[id]:", err);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const adminId = req.headers.get("x-admin-id");
    const ip      = req.headers.get("x-forwarded-for") ?? "unknown";
    if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const product = await db.product.findUnique({ where: { id } });
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await db.product.delete({ where: { id } });
    await audit(adminId, "DELETE", "Product", id, { name: product.name }, ip);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/cms/products/[id]:", err);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
