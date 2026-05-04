"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function useInView(ref: React.RefObject<HTMLDivElement | null>) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.2 }
    );

    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, [ref]);

  return visible;
}

export default function AboutCTA() {
  const ref = useRef<HTMLDivElement | null>(null);
  const visible = useInView(ref);

  const [content, setContent] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/cms/pages?page=about")
      .then((res) => res.json())
      .then((data) => {
        console.log("CTA API DATA:", data);

        if (typeof data === "object" && !Array.isArray(data)) {
          const normalized: Record<string, string> = {};

          Object.keys(data).forEach((key) => {
            normalized[key.toLowerCase()] = data[key];
          });

          setContent(normalized);
        } else {
          console.error("Unexpected data format:", data);
          setContent({});
        }
      })
      .catch((err) => console.error("CTA fetch error:", err));
  }, []);

  return (
    <section ref={ref} className="relative overflow-hidden">
      {/* BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/about-3.jpg"
          alt="Beautiful home"
          fill
          className={`object-cover transition-transform duration-[8s] ${
            visible ? "scale-110" : "scale-100"
          }`}
        />
        <div className="absolute inset-0 bg-black/85" />
      </div>

      {/* CONTENT */}
      <div className="relative z-10 text-white px-6 md:px-10 lg:px-16 py-28">
        {/* LABEL */}
        <p
          className={`text-xs font-bold tracking-widest uppercase text-white/40 mb-6 transition-all duration-700 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          {content["cta_label"] || "Work With Us"}
        </p>

        {/* TITLE */}
        <h2
          className={`text-5xl md:text-7xl font-black tracking-tight leading-none mb-8 transition-all duration-700 delay-100 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {content["cta_heading"] || "Start Your"} <br />
          <span className="italic font-extralight text-white/80">
            {content["cta_subheading"] || "Project Today."}
          </span>
        </h2>

        {/* BUTTON */}
        <Link
          href="/contact"
          className="group relative inline-flex items-center gap-3 px-10 py-5 bg-white text-black text-sm font-black tracking-widest uppercase transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden"
        >
          <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-black/10 to-transparent" />

          <span className="relative z-10 flex items-center gap-3">
            {content["cta_primary"] || "Get Free Consultation"}
            <ArrowRight
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </span>
        </Link>
      </div>
    </section>
  );
}