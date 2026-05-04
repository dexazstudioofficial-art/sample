import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SubPageTemplate from "@/components/products/sub-pages/SubPageTemplate";
import { db } from "@/lib/db";

interface Props {
  params: Promise<{ category: string; slug: string }>;
}

function parseJson<T>(val: string, fallback: T): T {
  try { return val ? JSON.parse(val) : fallback; } catch { return fallback; }
}

async function getServiceItem(slug: string) {
  return db.serviceItem.findUnique({
    where:   { slug, isActive: true },
    include: { serviceCat: { select: { name: true, slug: true } } },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item     = await getServiceItem(slug);
  if (!item) return { title: "Service Not Found" };

  const title = item.metaTitle || `${item.name} — SAM Enterprises`;
  const desc  = item.metaDesc  || item.description;

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      images:      item.heroImage || item.image ? [item.heroImage || item.image] : [],
      url:         `https://samenterprises.com/services/${item.serviceCat?.slug ?? "services"}/${item.slug}`,
    },
    alternates: {
      canonical: `https://samenterprises.com/services/${item.serviceCat?.slug ?? "services"}/${item.slug}`,
    },
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const item     = await getServiceItem(slug);
  if (!item) notFound();

  const data = {
    category:     item.category || item.serviceCat?.name || "Services",
    title:        item.name,
    tagline:      item.tagline      || "",
    heroImage:    item.heroImage    || item.image || "",
    description:  item.description,
    features:     parseJson<string[]>(item.features, []),
    specs:        parseJson<{ label: string; value: string }[]>(item.specs, []),
    variants:     parseJson<{ name: string; image: string; tags: string[]; description: string }[]>(item.variants, []),
    whyPoints:    parseJson<{ number: string; title: string; desc: string }[]>(item.whyPoints, []),
    relatedLinks: parseJson<{ href: string; label: string }[]>(item.relatedLinks, []),
    metaTitle:    item.metaTitle,
    metaDesc:     item.metaDesc,
    context:      "service" as const,
  };

  // JSON-LD
  const jsonLd = {
    "@context":  "https://schema.org",
    "@type":     "Service",
    name:        item.name,
    description: item.description,
    image:       item.heroImage || item.image,
    provider: {
      "@type": "Organization",
      name:    "SAM Enterprises",
      url:     "https://samenterprises.com",
    },
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="pt-0">
        <SubPageTemplate data={data} />
      </main>
      <Footer />
    </div>
  );
}
