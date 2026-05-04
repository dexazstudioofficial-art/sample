"use client";

import Image from "next/image";
import { Award } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const awards = [
  {
    title: "Best UPVC Manufacturer",
    body: "Tamil Nadu Building Industry Awards",
    year: "2022",
  },
  {
    title: "Excellence in Quality",
    body: "South India Construction Expo",
    year: "2021",
  },
  {
    title: "Top 10 Window Brands",
    body: "Construction World Magazine",
    year: "2020",
  },
  {
    title: "Green Building Partner",
    body: "IGBC — Indian Green Building Council",
    year: "2019",
  },
];

function useInView(ref: React.RefObject<HTMLDivElement | null>) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );

    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, [ref]);

  return visible;
}

export default function AwardsSection() {
  const ref = useRef<HTMLDivElement | null>(null);
  const visible = useInView(ref);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden border-b border-border"
    >
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/about-2.png"
          alt="Awards"
          fill
          priority
          sizes="100vw"
          className="object-cover scale-105"
        />
        <div className="absolute inset-0 bg-black/85" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-white px-6 md:px-10 lg:px-16 py-24">
        {/* HEADER */}
        <div
          className={`mb-16 transition-all duration-700 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <p className="text-xs tracking-[0.3em] uppercase text-white/40 mb-4">
            Recognition
          </p>

          <h2 className="text-4xl md:text-6xl font-black tracking-tight">
            Awards & <br />
            <span className="italic font-extralight text-white/70">
              Certifications
            </span>
          </h2>

          <p className="text-sm text-white/50 mt-4 max-w-xl">
            Recognized by leading construction and building industry bodies for
            quality, innovation, and sustainability.
          </p>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {awards.map(({ title, body, year }, i) => (
            <div
              key={title}
              className={`
                group relative p-8 rounded-2xl
                border border-white/10
                bg-white/5 backdrop-blur-md
                transition-all duration-500
                hover:bg-white/10
                hover:-translate-y-2
                hover:shadow-[0_0_40px_rgba(255,255,255,0.12)]
              `}
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(20px)",
                transitionDelay: visible ? `${i * 120}ms` : "0ms",
              }}
            >
              {/* glow */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

              {/* icon */}
              <div className="flex items-start gap-5 relative z-10">
                <div className="p-3 rounded-xl bg-white/10 group-hover:bg-white/20 transition-colors">
                  <Award
                    size={22}
                    className="text-white/60 group-hover:text-white transition-colors group-hover:rotate-12 duration-300"
                  />
                </div>

                {/* TEXT */}
                <div>
                  <p className="text-lg font-black text-white group-hover:text-white/95 transition-colors">
                    {title}
                  </p>

                  <p className="text-sm text-white/60 group-hover:text-white/80 mt-1 leading-relaxed transition-colors">
                    {body}
                  </p>

                  <p className="text-xs tracking-[0.25em] uppercase text-white/30 mt-3">
                    {year}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
