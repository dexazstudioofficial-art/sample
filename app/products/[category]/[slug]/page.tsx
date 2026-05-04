import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import SocialSidebar from "@/components/SocialSidebar";
import Footer from "@/components/Footer";
import SubPageTemplate from "@/components/products/sub-pages/SubPageTemplate";
import { db } from "@/lib/db";

interface Props {
  params: Promise<{ category: string; slug: string }>;
}

function parseJsonField<T>(val: string, fallback: T): T {
  try { return val ? JSON.parse(val) : fallback; } catch { return fallback; }
}

async function getProduct(slug: string) {
  return db.product.findUnique({
    where: { slug, isActive: true },
    include: { serviceCategory: { select: { name: true, slug: true } } },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product  = await getProduct(slug);
  if (!product) return { title: "Product Not Found" };

  const title = product.metaTitle || `${product.name} — SAM Enterprises`;
  const desc  = product.metaDesc  || product.description;

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description:  desc,
      images:       product.heroImage || product.image ? [product.heroImage || product.image] : [],
      type:         "website",
      url:          `https://samenterprises.com/products/${product.serviceCategory?.slug ?? "products"}/${product.slug}`,
    },
    alternates: {
      canonical: `https://samenterprises.com/products/${product.serviceCategory?.slug ?? "products"}/${product.slug}`,
    },
  };
}

export default async function DynamicProductPage({ params }: Props) {
  const { slug } = await params;
  const product  = await getProduct(slug);
  if (!product) notFound();

  // Build SubPageSpec from DB data
  const specs:     { label: string; value: string }[] = parseJsonField(product.specs, []);
  const features:  string[]                            = parseJsonField(product.features, []);
  const whyPoints: { number: string; title: string; desc: string }[] = parseJsonField(product.whyPoints, []);
  const relatedLinks: { href: string; label: string }[]               = parseJsonField(product.relatedLinks, []);
  const variants:  { name: string; image: string; tags: string[]; description: string }[] =
    parseJsonField(product.variants, []);

  const data = {
    category:     product.category,
    title:        product.name,
    tagline:      product.tagline || "",
    heroImage:    product.heroImage || product.image || "",
    description:  product.description,
    features,
    specs,
    variants,
    whyPoints,
    relatedLinks,
    metaTitle:    product.metaTitle,
    metaDesc:     product.metaDesc,
  };

  // JSON-LD schema
  const jsonLd = {
    "@context":    "https://schema.org",
    "@type":       "Product",
    name:          product.name,
    description:   product.description,
    image:         product.heroImage || product.image,
    brand: {
      "@type": "Brand",
      name:    "SAM Enterprises",
    },
    offers: {
      "@type":        "Offer",
      availability:   "https://schema.org/InStock",
      priceCurrency:  "INR",
      seller: {
        "@type": "Organization",
        name:    "SAM Enterprises",
      },
    },
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <SocialSidebar />
      <main className="pt-0">
        <SubPageTemplate data={data} />
      </main>
      <Footer />
    </div>
  );
}
