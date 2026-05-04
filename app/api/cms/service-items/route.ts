import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { audit } from "@/lib/auth";

const Schema = z.object({
  slug:         z.string().min(2),
  name:         z.string().min(2),
  category:     z.string().min(1),
  subCategory:  z.string().default(""),
  serviceCatId: z.string().min(1).nullable().optional(),
  description:  z.string().default(""),
  tagline:      z.string().default(""),
  heroImage:    z.string().url().or(z.literal("")).default(""),
  image:        z.string().url().or(z.literal("")).default(""),
  specs:        z.array(z.object({ label: z.string(), value: z.string() })).default([]),
  features:     z.array(z.string()).default([]),
  tags:         z.array(z.string()).default([]),
  whyPoints:    z.array(z.object({ number: z.string(), title: z.string(), desc: z.string() })).default([]),
  relatedLinks: z.array(z.object({ href: z.string(), label: z.string() })).default([]),
  variants:     z.array(z.object({ name: z.string(), image: z.string().default(""), tags: z.array(z.string()).default([]), description: z.string().default("") })).default([]),
  metaTitle:    z.string().default(""),
  metaDesc:     z.string().default(""),
  isActive:     z.boolean().default(true),
  sortOrder:    z.number().int().default(0),
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

export async function GET(req: NextRequest) {
  try {
    const serviceCatId = req.nextUrl.searchParams.get("serviceCatId");
    const items = await db.serviceItem.findMany({
      where:   serviceCatId ? { serviceCatId } : undefined,
      include: { serviceCat: { select: { id: true, name: true, slug: true, sortOrder: true } } },
      orderBy: { sortOrder: "asc" },
    });
    const sorted = items.sort((a, b) => {
      const ao = a.serviceCat?.sortOrder ?? 999;
      const bo = b.serviceCat?.sortOrder ?? 999;
      return ao !== bo ? ao - bo : a.sortOrder - b.sortOrder;
    });
    return NextResponse.json(sorted.map(serialize));
  } catch (err) {
    console.error("GET /api/cms/service-items:", err);
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

    const existing = await db.serviceItem.findUnique({ where: { slug: parsed.data.slug } });
    if (existing) return NextResponse.json({ error: "Slug already exists" }, { status: 409 });

    if (parsed.data.serviceCatId) {
      const cat = await db.serviceCat.findUnique({ where: { id: parsed.data.serviceCatId } });
      if (!cat) return NextResponse.json({ error: "Service category not found" }, { status: 400 });
    }

    const { specs, features, tags, whyPoints, relatedLinks, variants, ...rest } = parsed.data;
    const item = await db.serviceItem.create({
      data: {
        ...rest,
        specs:        JSON.stringify(specs),
        features:     JSON.stringify(features),
        tags:         JSON.stringify(tags),
        whyPoints:    JSON.stringify(whyPoints),
        relatedLinks: JSON.stringify(relatedLinks),
        variants:     JSON.stringify(variants),
      },
      include: { serviceCat: { select: { id: true, name: true, slug: true } } },
    });
    await audit(adminId, "CREATE", "ServiceItem", item.id, { name: item.name }, ip);
    return NextResponse.json(serialize(item as unknown as Record<string, unknown>), { status: 201 });
  } catch (err) {
    console.error("POST /api/cms/service-items:", err);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
