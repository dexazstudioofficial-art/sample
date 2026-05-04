"use client";

import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { usePageContent } from "@/lib/usePageContent";

export default function CTASection() {
  const { get } = usePageContent("home");

  const ctaHeading    = get("cta", "heading",     "Get Your Free\nConsultation Today");
  const ctaSubheading = get("cta", "subheading",  "Our experts will visit your site, understand your needs, and provide a detailed, no-obligation quotation — all within 48 hours.");
  const ctaLabel      = get("cta", "label",       "Ready to Begin?");
  const ctaButton     = get("cta", "button_text", "Book Consultation");
  const ctaPhone      = get("cta", "phone",       "+91 73388 80509");

  const headingLines = ctaHeading.split("\n");

  return (
    <section className="relative border-b border-border overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse opacity-40" />

      <div className="px-6 md:px-10 lg:px-16 py-24 relative">
        <div className="max-w-4xl">
          <p className="label-sm mb-6 opacity-0 animate-[fadeInUp_0.6s_ease-out_forwards]">
            {ctaLabel}
          </p>

          <h2 className="text-4xl md:text-6xl font-black tracking-tight text-foreground leading-tight mb-8 opacity-0 animate-[fadeInUp_0.8s_ease-out_forwards]">
            {headingLines.map((line, i) => (
              <span key={i}>
                {i === 1
                  ? <span className="italic font-extralight text-black/80">{line}</span>
                  : line}
                {i < headingLines.length - 1 && <br />}
              </span>
            ))}
          </h2>

          <p className="text-base text-muted-foreground leading-relaxed max-w-xl mb-10 opacity-0 animate-[fadeInUp_1s_ease-out_forwards]">
            {ctaSubheading}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 opacity-0 animate-[fadeInUp_1.2s_ease-out_forwards]">
            <Link
              href="/contact"
              className="relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-foreground text-background text-sm font-bold tracking-widest uppercase transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-white/10 active:scale-95 overflow-hidden group"
            >
              <span className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
              <span className="relative flex items-center gap-2">
                {ctaButton}
                <ArrowRight size={16} />
              </span>
            </Link>

            <a
              href={`tel:${ctaPhone.replace(/\s/g, "")}`}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-border text-foreground text-sm font-medium tracking-wide transition-all duration-300 hover:bg-white/5 hover:scale-105 active:scale-95 hover:border-white/30"
            >
              <Phone size={10} />
              {ctaPhone}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
