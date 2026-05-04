import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

function parseJsonField<T>(val: string, fallback: T): T {
  try { return val ? JSON.parse(val) : fallback; } catch { return fallback; }
}

function serialize(p: {
  specs: string; features: string; tags: string;
  whyPoints: string; relatedLinks: string; variants: string;
  serviceCategory?: { id: string; name: string; slug: string; sortOrder: number } | null;
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

// GET /api/public/products — no auth required
export async function GET(req: NextRequest) {
  try {
    const serviceCategoryId = req.nextUrl.searchParams.get("serviceCategoryId");
    const category          = req.nextUrl.searchParams.get("category");
    const slug              = req.nextUrl.searchParams.get("slug");

    const where: Record<string, unknown> = { isActive: true };
    if (serviceCategoryId) where.serviceCategoryId = serviceCategoryId;
    if (category)          where.category          = category;
    if (slug)              where.slug              = slug;

    const products = await db.product.findMany({
      where,
      include: {
        serviceCategory: { select: { id: true, name: true, slug: true, sortOrder: true } },
      },
      orderBy: { sortOrder: "asc" },
    });

    const sorted = products.sort((a, b) => {
      const ao = a.serviceCategory?.sortOrder ?? 999;
      const bo = b.serviceCategory?.sortOrder ?? 999;
      return ao !== bo ? ao - bo : a.sortOrder - b.sortOrder;
    });

    // If fetching single product by slug, return object not array
    if (slug) {
      if (!sorted[0]) return NextResponse.json(null, { status: 404 });
      return NextResponse.json(serialize(sorted[0]));
    }

    return NextResponse.json(sorted.map(serialize));
  } catch (err) {
    console.error("GET /api/public/products:", err);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
