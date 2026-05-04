"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePageContent } from "@/lib/usePageContent";

function useInView(ref: React.RefObject<HTMLDivElement | null>) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.3 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);
  return visible;
}

export default function ContactHero() {
  const ref     = useRef<HTMLDivElement | null>(null);
  const visible = useInView(ref);
  const { get } = usePageContent("contact");

  const heading    = get("hero", "heading",    "Let's Discuss\nYour Project");
  const subheading = get("hero", "subheading", "Whether you're planning a new build, renovation, or replacement project, our team is ready to help. Schedule a free site visit and consultation.");

  const headingLines = heading.split("\n");

  return (
    <section className="relative min-h-[50vh] md:min-h-[70vh] flex items-end overflow-hidden bg-black">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/contact-bg.png"
          alt="Contact us"
          fill
          priority
          className="object-cover scale-110 animate-[slowZoom_12s_ease-in-out_infinite]"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
      </div>

      {/* Content */}
      <div ref={ref} className="relative z-10 w-full px-6 md:px-10 lg:px-16 pb-10 md:pb-16">
        <p
          className="text-xs tracking-[0.3em] uppercase text-zinc-400 mb-4"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(12px)", transition: "all 0.6s ease-out" }}
        >
          Contact
        </p>

        <h1
          className="text-4xl md:text-6xl lg:text-8xl font-black tracking-tight leading-tight md:leading-none text-white mb-4 md:mb-6"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)", transition: "all 0.9s ease-out" }}
        >
          {headingLines.map((line, i) => (
            <span key={i}>
              {i === 1
                ? <span className="italic font-extralight text-zinc-300">{line}</span>
                : line}
              {i < headingLines.length - 1 && <br />}
            </span>
          ))}
        </h1>

        <p
          className="text-sm text-zinc-400 max-w-xl leading-relaxed"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)", transition: "all 1.1s ease-out" }}
        >
          {subheading}
        </p>
      </div>

      <style jsx>{`
        @keyframes slowZoom {
          0%   { transform: scale(1.1); }
          50%  { transform: scale(1.15); }
          100% { transform: scale(1.1); }
        }
      `}</style>
    </section>
  );
}
