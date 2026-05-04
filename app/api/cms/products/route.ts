import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { audit } from "@/lib/auth";

const ProductSchema = z.object({
  slug:              z.string().min(2),
  name:              z.string().min(2),
  category:          z.string().min(1),
  subCategory:       z.string().default(""),
  serviceCategoryId: z.string().min(1).nullable().optional(),
  description:       z.string().default(""),
  tagline:           z.string().default(""),
  heroImage:         z.string().url().or(z.literal("")).default(""),
  image:             z.string().url().or(z.literal("")).default(""),
  specs:             z.array(z.object({ label: z.string(), value: z.string() })).default([]),
  features:          z.array(z.string()).default([]),
  tags:              z.array(z.string()).default([]),
  whyPoints:         z.array(z.object({ number: z.string(), title: z.string(), desc: z.string() })).default([]),
  relatedLinks:      z.array(z.object({ href: z.string(), label: z.string() })).default([]),
  variants:          z.array(z.object({ name: z.string(), image: z.string().default(""), tags: z.array(z.string()).default([]), description: z.string().default("") })).default([]),
  metaTitle:         z.string().default(""),
  metaDesc:          z.string().default(""),
  isActive:          z.boolean().default(true),
  sortOrder:         z.number().int().default(0),
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

export async function GET(req: NextRequest) {
  try {
    const serviceCategoryId = req.nextUrl.searchParams.get("serviceCategoryId");
    const category          = req.nextUrl.searchParams.get("category");
    const where: Record<string, unknown> = {};
    if (serviceCategoryId) where.serviceCategoryId = serviceCategoryId;
    if (category)          where.category          = category;

    const products = await db.product.findMany({
      where:   Object.keys(where).length ? where : undefined,
      include: { serviceCategory: { select: { id: true, name: true, slug: true, sortOrder: true } } },
      orderBy: { sortOrder: "asc" },
    });

    const sorted = products.sort((a, b) => {
      const ao = a.serviceCategory?.sortOrder ?? 999;
      const bo = b.serviceCategory?.sortOrder ?? 999;
      return ao !== bo ? ao - bo : a.sortOrder - b.sortOrder;
    });

    return NextResponse.json(sorted.map(serialize));
  } catch (err) {
    console.error("GET /api/cms/products:", err);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminId = req.headers.get("x-admin-id");
    const ip      = req.headers.get("x-forwarded-for") ?? "unknown";
    if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let body: unknown;
    try { body = await req.json(); } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = ProductSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const existing = await db.product.findUnique({ where: { slug: parsed.data.slug } });
    if (existing) return NextResponse.json({ error: "Slug already exists" }, { status: 409 });

    if (parsed.data.serviceCategoryId) {
      const cat = await db.serviceCategory.findUnique({ where: { id: parsed.data.serviceCategoryId } });
      if (!cat) return NextResponse.json({ error: "Service category not found" }, { status: 400 });
    }

    const { specs, features, tags, whyPoints, relatedLinks, variants, ...rest } = parsed.data;
    const product = await db.product.create({
      data: {
        ...rest,
        specs:        JSON.stringify(specs),
        features:     JSON.stringify(features),
        tags:         JSON.stringify(tags),
        whyPoints:    JSON.stringify(whyPoints),
        relatedLinks: JSON.stringify(relatedLinks),
        variants:     JSON.stringify(variants),
      },
      include: { serviceCategory: { select: { id: true, name: true, slug: true } } },
    });

    await audit(adminId, "CREATE", "Product", product.id, { name: product.name }, ip);
    return NextResponse.json(serialize(product), { status: 201 });
  } catch (err) {
    console.error("POST /api/cms/products:", err);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
