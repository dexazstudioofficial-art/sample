import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

const BASE = "https://samenterprises.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE,               lastModified: new Date(), changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE}/about`,    lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/products`, lastModified: new Date(), changeFrequency: "weekly",  priority: 0.9 },
    { url: `${BASE}/services`, lastModified: new Date(), changeFrequency: "weekly",  priority: 0.9 },
    { url: `${BASE}/blog`,     lastModified: new Date(), changeFrequency: "weekly",  priority: 0.7 },
    { url: `${BASE}/contact`,  lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/search`,   lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  // Product routes
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const products = await db.product.findMany({
      where:   { isActive: true },
      include: { serviceCategory: { select: { slug: true } } },
    });
    productRoutes = products.map((p) => ({
      url:             `${BASE}/products/${p.serviceCategory?.slug ?? "products"}/${p.slug}`,
      lastModified:    p.createdAt,
      changeFrequency: "weekly" as const,
      priority:        0.8,
    }));
  } catch {}

  // Service item routes
  let serviceRoutes: MetadataRoute.Sitemap = [];
  try {
    const items = await db.serviceItem.findMany({
      where:   { isActive: true },
      include: { serviceCat: { select: { slug: true } } },
    });
    serviceRoutes = items.map((s) => ({
      url:             `${BASE}/services/${s.serviceCat?.slug ?? "services"}/${s.slug}`,
      lastModified:    s.createdAt,
      changeFrequency: "weekly" as const,
      priority:        0.8,
    }));
  } catch {}

  // Blog routes
  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    const posts = await db.blog.findMany({
      where:  { isPublished: true },
      select: { slug: true, updatedAt: true },
    });
    blogRoutes = posts.map((p) => ({
      url:             `${BASE}/blog/${p.slug}`,
      lastModified:    p.updatedAt,
      changeFrequency: "monthly" as const,
      priority:        0.6,
    }));
  } catch {}

  return [...staticRoutes, ...productRoutes, ...serviceRoutes, ...blogRoutes];
}
