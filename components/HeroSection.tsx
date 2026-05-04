"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { motion, useInView, useMotionValue, animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { usePageContent } from "@/lib/usePageContent";

// ─── Animated counter ────────────────────────────────────
function Counter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const isInView = useInView(ref, { once: true });
  const motionValue = useMotionValue(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(motionValue, value, {
      duration: 2,
      ease: "easeOut",
      onUpdate: (latest) => setDisplay(Math.floor(latest)),
    });
    return controls.stop;
  }, [isInView, value, motionValue]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

export default function HeroSection() {
  const { get, ready } = usePageContent("home");

  // CMS-driven values with sensible fallbacks
  const heading     = get("hero", "heading",      "Windows\nThat Define\nYour Space.");
  const subheading  = get("hero", "subheading",   "Custom-fabricated UPVC and PVC products engineered for energy efficiency, acoustic comfort, and lasting elegance.");
  const ctaPrimary  = get("hero", "cta_primary",  "Get Free Consultation");
  const ctaSecondary= get("hero", "cta_secondary","Explore Products");

  const stat1Value  = get("stats", "stat1_value", "2,000+");
  const stat1Label  = get("stats", "stat1_label", "Projects");
  const stat2Value  = get("stats", "stat2_value", "15+");
  const stat2Label  = get("stats", "stat2_label", "Years");
  const stat3Value  = get("stats", "stat3_value", "10yr");
  const stat3Label  = get("stats", "stat3_label", "Warranty");
  const stat4Value  = get("stats", "stat4_value", "98%");
  const stat4Label  = get("stats", "stat4_label", "Satisfaction");

  const staticStats = [
    { label: stat1Label, display: stat1Value },
    { label: stat2Label, display: stat2Value },
    { label: stat3Label, display: stat3Value },
    { label: stat4Label, display: stat4Value },
  ];

  // Render heading with newline support
  const headingLines = heading.split("\n");

  return (
    <section className="relative min-h-screen flex items-end overflow-hidden">
      {/* Background Image */}
      <motion.div
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute inset-0 z-0"
      >
        <Image
          src="/hero-bg.png"
          alt="Modern architecture"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-white/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 w-full px-6 md:px-10 lg:px-16 pt-28 md:pt-1">
        <div className="max-w-5xl text-foreground">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-4"
          >
            Premium UPVC and PVC Solutions — Chennai &amp; South India
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-5xl md:text-7xl lg:text-[8rem] font-black tracking-tight leading-none mb-8"
          >
            {ready
              ? headingLines.map((line, i) => (
                  <span key={i}>
                    {i === 1 ? (
                      <span className="italic font-extralight">{line}</span>
                    ) : (
                      line
                    )}
                    {i < headingLines.length - 1 && <br />}
                  </span>
                ))
              : (
                <>
                  Interiors
                  <br />
                  <span className="italic font-extralight">That Define</span>
                  <br />
                  Your Space.
                </>
              )}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-base md:text-lg leading-relaxed max-w-xl mb-10"
          >
            {subheading}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 pb-16"
          >
            <Link
              href="/contact"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-foreground text-background text-sm font-bold tracking-widest uppercase transition-all duration-300 hover:bg-foreground/80 hover:scale-105"
            >
              {ctaPrimary}
              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>

            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-border text-foreground text-sm font-medium transition-all duration-300 hover:bg-muted hover:scale-105"
            >
              {ctaSecondary}
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="absolute bottom-0 right-0 z-10 hidden lg:flex">
        <div className="bg-foreground text-background flex divide-x divide-background/10">
          {staticStats.map(({ label, display }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + i * 0.2 }}
              className="px-8 py-6 text-center"
            >
              <p className="text-xl font-black">{display}</p>
              <p className="text-xs opacity-50 tracking-widest uppercase mt-1">
                {label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
