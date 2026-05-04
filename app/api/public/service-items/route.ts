import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

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
    const slug         = req.nextUrl.searchParams.get("slug");

    const where: Record<string, unknown> = { isActive: true };
    if (serviceCatId) where.serviceCatId = serviceCatId;
    if (slug)         where.slug         = slug;

    const items = await db.serviceItem.findMany({
      where,
      include: { serviceCat: { select: { id: true, name: true, slug: true, sortOrder: true } } },
      orderBy: { sortOrder: "asc" },
    });

    const sorted = items.sort((a, b) => {
      const ao = a.serviceCat?.sortOrder ?? 999;
      const bo = b.serviceCat?.sortOrder ?? 999;
      return ao !== bo ? ao - bo : a.sortOrder - b.sortOrder;
    });

    if (slug) {
      if (!sorted[0]) return NextResponse.json(null, { status: 404 });
      return NextResponse.json(serialize(sorted[0] as unknown as Record<string, unknown>));
    }

    return NextResponse.json(sorted.map((i) => serialize(i as unknown as Record<string, unknown>)));
  } catch (err) {
    console.error("GET /api/public/service-items:", err);
    return NextResponse.json([]);
  }
}
