import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get("q")?.trim() || "";
    const type = req.nextUrl.searchParams.get("type") || "all";

    if (q.length < 2) {
      return NextResponse.json({ products: [], services: [], total: 0 });
    }

    const searchStr = q.toLowerCase();
    const results: { products: unknown[]; services: unknown[]; total: number } = {
      products: [], services: [], total: 0,
    };

    // Search products
    if (type === "all" || type === "products") {
      const products = await db.product.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: searchStr } },
            { category: { contains: searchStr } },
            { description: { contains: searchStr } },
            { tagline: { contains: searchStr } },
            { tags: { contains: searchStr } },
          ],
        },
        include: { serviceCategory: { select: { name: true, slug: true } } },
        take: 20,
      });

      results.products = products.map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        category: p.category,
        description: p.description,
        image: p.heroImage || p.image,
        serviceCategory: p.serviceCategory,
        type: "product",
        url: `/products/${p.serviceCategory?.slug ?? "products"}/${p.slug}`,
      })) as unknown[];
    }

    // Search services
    if (type === "all" || type === "services") {
      const services = await db.serviceItem.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: searchStr } },
            { description: { contains: searchStr } },
            { category: { contains: searchStr } },
          ],
        },
        include: { serviceCat: { select: { name: true, slug: true } } },
        take: 10,
      });

      results.services = services.map((s) => ({
        id: s.id,
        slug: s.slug,
        name: s.name,
        description: s.description,
        image: s.heroImage || s.image,
        type: "service",
        url: `/services/${s.serviceCat?.slug ?? "services"}/${s.slug}`,
      }))as unknown[];
    }

    results.total = results.products.length + results.services.length;
    return NextResponse.json(results);
  } catch (err) {
    console.error("GET /api/public/search error:", err);
    return NextResponse.json({ products: [], services: [], total: 0 });
  }
}
