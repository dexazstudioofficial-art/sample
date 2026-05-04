import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { audit } from "@/lib/auth";

const UpdateSchema = z.object({
  slug:         z.string().min(2).optional(),
  name:         z.string().min(2).optional(),
  category:     z.string().min(1).optional(),
  subCategory:  z.string().optional(),
  serviceCatId: z.string().min(1).nullable().optional(),
  description:  z.string().optional(),
  tagline:      z.string().optional(),
  heroImage:    z.string().url().or(z.literal("")).optional(),
  image:        z.string().url().or(z.literal("")).optional(),
  specs:        z.array(z.object({ label: z.string(), value: z.string() })).optional(),
  features:     z.array(z.string()).optional(),
  tags:         z.array(z.string()).optional(),
  whyPoints:    z.array(z.object({ number: z.string(), title: z.string(), desc: z.string() })).optional(),
  relatedLinks: z.array(z.object({ href: z.string(), label: z.string() })).optional(),
  variants:     z.array(z.object({ name: z.string(), image: z.string().default(""), tags: z.array(z.string()).default([]), description: z.string().default("") })).optional(),
  metaTitle:    z.string().optional(),
  metaDesc:     z.string().optional(),
  isActive:     z.boolean().optional(),
  sortOrder:    z.number().int().optional(),
});

function parseJson<T>(val: string, fallback: T): T {
  try { return val ? JSON.parse(val) : fallback; } catch { return fallback; }
}

function serialize(item: Record<string, unknown>) {
  return {
    ...item,
    specs:        parseJson(item.specs as string, []),
    features:     parseJson(item.features as string, []),
    tags:         parseJson(item.tags as string, []),
    whyPoints:    parseJson(item.whyPoints as string, []),
    relatedLinks: parseJson(item.relatedLinks as string, []),
    variants:     parseJson(item.variants as string, []),
  };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const item = await db.serviceItem.findUnique({
      where:   { id },
      include: { serviceCat: { select: { id: true, name: true, slug: true } } },
    });
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(serialize(item as unknown as Record<string, unknown>));
  } catch (err) {
    console.error("GET /api/cms/service-items/[id]:", err);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
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

    const existing = await db.serviceItem.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body   = await req.json();
    const parsed = UpdateSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });

    const { specs, features, tags, whyPoints, relatedLinks, variants, slug, ...rest } = parsed.data;
    const data: Record<string, unknown> = { ...rest };

    if (slug && slug !== existing.slug) {
      const taken = await db.serviceItem.findUnique({ where: { slug } });
      if (taken) return NextResponse.json({ error: "Slug already in use" }, { status: 409 });
      data.slug = slug;
      await db.slugRedirect.upsert({
        where:  { oldSlug: existing.slug },
        update: { newSlug: slug },
        create: { oldSlug: existing.slug, newSlug: slug, entity: "service" },
      });
    }

    if (specs !== undefined)        data.specs        = JSON.stringify(specs);
    if (features !== undefined)     data.features     = JSON.stringify(features);
    if (tags !== undefined)         data.tags         = JSON.stringify(tags);
    if (whyPoints !== undefined)    data.whyPoints    = JSON.stringify(whyPoints);
    if (relatedLinks !== undefined) data.relatedLinks = JSON.stringify(relatedLinks);
    if (variants !== undefined)     data.variants     = JSON.stringify(variants);

    const item = await db.serviceItem.update({
      where:   { id },
      data,
      include: { serviceCat: { select: { id: true, name: true, slug: true } } },
    });
    await audit(adminId, "UPDATE", "ServiceItem", id, { name: item.name }, ip);
    return NextResponse.json({ ok: true, item: serialize(item as unknown as Record<string, unknown>) });
  } catch (err) {
    console.error("PATCH /api/cms/service-items/[id]:", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
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

    const item = await db.serviceItem.findUnique({ where: { id } });
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await db.serviceItem.delete({ where: { id } });
    await audit(adminId, "DELETE", "ServiceItem", id, { name: item.name }, ip);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/cms/service-items/[id]:", err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
