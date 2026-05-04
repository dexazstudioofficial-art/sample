"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Check } from "lucide-react";
import EnquiryModal, { type EnquiryProduct } from "@/components/EnquiryModal";

export interface SubPageSpec {
  category:     string;
  title:        string;
  tagline:      string;
  heroImage:    string;
  description:  string;
  features:     string[];
  specs:        { label: string; value: string }[];
  variants:     { name: string; image: string; tags: string[]; description: string }[];
  whyPoints:    { number: string; title: string; desc: string }[];
  relatedLinks: { href: string; label: string }[];
  metaTitle?:   string;
  metaDesc?:    string;
  context?:     "product" | "service"; // passed from page
}

type Variant = SubPageSpec["variants"][number];

export default function SubPageTemplate({ data }: { data: SubPageSpec }) {
  const {
    category, title, tagline, heroImage, description,
    features, specs, variants, whyPoints, relatedLinks,
    context = "product",
  } = data;

  const [enquiryProduct, setEnquiryProduct] = useState<EnquiryProduct | null>(null);
  const [visible,        setVisible]        = useState<Record<string, boolean>>({});
  const [whatsappNumber, setWhatsappNumber] = useState("919876543210");

  useEffect(() => {
    fetch("/api/public/settings?key=whatsapp_number")
      .then((r) => r.json())
      .then((d) => { if (d?.value) setWhatsappNumber(d.value.replace(/\D/g, "")); })
      .catch(() => {});
  }, []);

  const heroRef    = useRef<HTMLElement | null>(null);
  const featureRef = useRef<HTMLElement | null>(null);
  const variantRef = useRef<HTMLElement | null>(null);
  const whyRef     = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.getAttribute("data-reveal");
          if (id && entry.isIntersecting) setVisible((prev) => ({ ...prev, [id]: true }));
        });
      },
      { threshold: 0.15 },
    );
    const targets: [string, HTMLElement | null][] = [
      ["hero", heroRef.current], ["features", featureRef.current],
      ["variants", variantRef.current], ["why", whyRef.current],
    ];
    targets.forEach(([id, el]) => {
      if (el) { el.setAttribute("data-reveal", id); observer.observe(el); }
    });
    return () => observer.disconnect();
  }, []);

  function openEnquiry(v: Variant) {
    setEnquiryProduct({
      name:        `${title} — ${v.name}`,
      category, image: v.image,
      specs:       v.tags,
      features,
      description: v.description,
      context,
    });
  }

  function openGeneralEnquiry() {
    setEnquiryProduct({
      name: title, category,
      image:       heroImage,
      specs:       specs.map((s) => `${s.label}: ${s.value}`),
      features,
      description,
      context,
    });
  }

  function openWhatsApp() {
    const isService = context === "service";
    const message = [
      `Hello SAM Enterprises,`,
      ``,
      `I would like a quote for:`,
      `${isService ? "Service" : "Product"}: ${title}`,
      `Category: ${category}`,
      ``,
      `Specifications:`,
      ...specs.map((s) => `- ${s.label}: ${s.value}`),
      ``,
      `Please share pricing and availability.`,
    ].join("\n");
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank");
  }

  const reveal = (key: string) =>
    visible[key] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10";

  const ctaButtonText = context === "service" ? "Book a Service Enquiry" : "Book a Product Enquiry";

  return (
    <div className="bg-white text-black overflow-x-hidden">
      {/* HERO */}
      <section ref={heroRef}
        className={`relative min-h-[50vh] md:min-h-[70vh] flex items-end transition-all duration-700 ${reveal("hero")}`}>
        <div className="absolute inset-0">
          {heroImage
            ? <Image src={heroImage} alt={title} fill className="object-cover scale-105" priority />
            : <div className="w-full h-full bg-gray-200" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>
        <div className="relative z-10 w-full px-6 md:px-12 pb-10 md:pb-16 text-white">
          <nav className="flex items-center gap-2 text-white/70 text-xs uppercase flex-wrap mb-4">
            <Link href="/products">Products</Link>
            <ChevronRight size={12} />
            <span>{category}</span>
            <ChevronRight size={12} />
            <span className="text-white">{title}</span>
          </nav>
          <h1 className="text-3xl md:text-5xl lg:text-7xl font-black leading-tight">
            {title}
            {tagline && <><br /><span className="italic font-light text-white/80 text-2xl md:text-4xl lg:text-5xl">{tagline}</span></>}
          </h1>
          <p className="mt-4 max-w-xl text-white/70 text-sm md:text-base leading-relaxed hidden md:block">
            {description}
          </p>
        </div>
      </section>

      {/* Description - mobile */}
      <div className="px-6 py-6 md:hidden border-b">
        <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
      </div>

      {/* FEATURES + SPECS */}
      {(features.length > 0 || specs.length > 0) && (
        <section ref={featureRef}
          className={`grid grid-cols-1 lg:grid-cols-2 border-t transition-all duration-700 ${reveal("features")}`}>
          {features.length > 0 && (
            <div className="p-6 md:p-16">
              <h2 className="text-xs font-bold uppercase tracking-widest mb-6 text-gray-400">Key Features</h2>
              <div className="space-y-4">
                {features.map((f, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="w-5 h-5 border border-gray-300 flex items-center justify-center mt-0.5 shrink-0">
                      <Check size={11} />
                    </div>
                    <span className="text-sm leading-relaxed">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {specs.length > 0 && (
            <div className="p-6 md:p-16 bg-black/[0.03]">
              <h2 className="text-xs font-bold uppercase tracking-widest mb-6 text-gray-400">Specifications</h2>
              <div className="border rounded-xl overflow-hidden">
                {specs.map((s, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:justify-between px-5 py-4 border-b last:border-0">
                    <span className="text-xs uppercase text-black/60 font-medium">{s.label}</span>
                    <span className="text-sm font-medium sm:text-right mt-1 sm:mt-0">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* VARIANTS */}
      {variants.length > 0 && (
        <section ref={variantRef}
          className={`px-6 md:px-12 py-16 border-t transition-all duration-700 ${reveal("variants")}`}>
          <h2 className="text-2xl md:text-3xl font-black mb-8">
            Choose Your <span className="font-light italic">Configuration</span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {variants.map((v, i) => (
              <div key={i} className="border rounded-xl overflow-hidden">
                <div className="relative h-48 md:h-60 bg-gray-100">
                  {v.image
                    ? <Image src={v.image} alt={v.name} fill className="object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">{v.name}</div>}
                </div>
                <div className="p-5">
                  <h3 className="font-black text-base">{v.name}</h3>
                  {v.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {v.tags.map((t, j) => <span key={j} className="text-[10px] border px-2 py-0.5">{t}</span>)}
                    </div>
                  )}
                  <p className="text-xs text-black/60 mt-2 leading-relaxed">{v.description}</p>
                  <button onClick={() => openEnquiry(v)}
                    className="mt-4 w-full bg-black text-white py-3 text-xs uppercase font-bold hover:bg-gray-800 transition-colors rounded">
                    {ctaButtonText}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* WHY */}
      {whyPoints.length > 0 && (
        <section ref={whyRef}
          className={`px-6 md:px-12 py-16 border-t transition-all duration-700 ${reveal("why")}`}>
          <h2 className="text-2xl md:text-3xl font-black mb-8">
            Built for <span className="font-light italic">South India</span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 border rounded-xl overflow-hidden">
            {whyPoints.map((p, i) => (
              <div key={i} className="p-6 md:p-8 border-b lg:border-b-0 lg:border-r last:border-0">
                <div className="text-3xl md:text-4xl font-black opacity-20">{p.number}</div>
                <h3 className="font-bold mt-3 text-sm md:text-base">{p.title}</h3>
                <p className="text-xs mt-2 opacity-70 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* RELATED */}
      {relatedLinks.length > 0 && (
        <section className="px-6 md:px-12 py-10 border-t bg-gray-50">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-4">Related Products</p>
          <div className="flex flex-wrap gap-3">
            {relatedLinks.map(({ href, label }, i) => (
              <Link key={i} href={href}
                className="px-4 py-2 border border-gray-200 text-sm hover:border-black hover:bg-black hover:text-white transition-colors">
                {label}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-black text-white px-6 md:px-12 py-14">
        <div className="flex flex-col md:flex-row justify-between gap-8 items-start md:items-center">
          <div>
            <p className="text-xs uppercase opacity-50 mb-2">Ready to Order</p>
            <h2 className="text-2xl md:text-3xl font-black">
              Get a Quote for <span className="italic font-light">{title}</span>
            </h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={openGeneralEnquiry}
              className="px-6 py-4 bg-green-500 hover:bg-green-400 transition-colors text-xs uppercase font-black whitespace-nowrap">
              {ctaButtonText}
            </button>
            <button onClick={openWhatsApp}
              className="px-6 py-4 border border-white/30 hover:bg-white/10 transition-colors text-xs uppercase font-black whitespace-nowrap">
              WhatsApp Enquiry
            </button>
          </div>
        </div>
      </section>

      {enquiryProduct && (
        <EnquiryModal product={enquiryProduct} onClose={() => setEnquiryProduct(null)} />
      )}
    </div>
  );
}
