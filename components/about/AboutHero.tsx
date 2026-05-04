"use client";

import Image from "next/image";
import { usePageContent } from "@/lib/usePageContent";

export default function AboutHero() {
  const { get } = usePageContent("about");

  const heading    = get("hero", "heading",    "Crafting Quality\nSince 2008.");
  const subheading = get("hero", "subheading", "From a small fabrication unit in Chennai to South India's most trusted UPVC fenestration company.");

  const headingLines = heading.split("\n");

  return (
    <section className="relative min-h-[70vh] md:min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 scale-110 animate-slowZoom">
          <Image
            src="/about-bg.jpg"
            alt="Manufacturing facility"
            fill
            priority
            className="object-cover blur-sm"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/10 animate-gradientMove" />
      </div>

      {/* Floating blobs — hidden on mobile to prevent overflow */}
      <div className="absolute inset-0 z-0 overflow-hidden hidden md:block">
        <div className="absolute w-[300px] h-[300px] lg:w-[400px] lg:h-[400px] bg-primary/20 blur-3xl rounded-full top-10 left-10 animate-floatSlow" />
        <div className="absolute w-[200px] h-[200px] lg:w-[300px] lg:h-[300px] bg-blue-500/10 blur-3xl rounded-full bottom-10 right-10 animate-floatSlow2" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full px-6 md:px-10 lg:px-16 py-20 md:py-0">
        <p className="label-sm mb-4 md:mb-6 tracking-[0.3em] opacity-0 animate-fadeUp1 text-xs md:text-sm">
          About SAM Enterprises
        </p>

        <h1 className="text-4xl md:text-7xl lg:text-[9rem] font-black leading-tight md:leading-none mb-4 md:mb-6 opacity-0 animate-fadeUp2">
          {headingLines.map((line, i) => (
            <span key={i}>
              {i === 1
                ? <span className="italic font-extralight text-primary animate-pulseSlow">{line}</span>
                : line}
              {i < headingLines.length - 1 && <br />}
            </span>
          ))}
        </h1>

        <p className="text-sm md:text-base lg:text-lg text-muted-foreground max-w-xl leading-relaxed opacity-0 animate-fadeUp3">
          {subheading}
        </p>
      </div>
    </section>
  );
}
