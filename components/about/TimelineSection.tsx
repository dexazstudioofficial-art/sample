"use client";

import { useEffect, useRef, useState } from "react";

const milestones = [
  {
    year: "2008",
    desc: "Founded in Chennai with a 3-person team and a single fabrication machine.",
  },
  {
    year: "2011",
    desc: "Expanded to Coimbatore and Madurai. Crossed 500 residential installations.",
  },
  {
    year: "2014",
    desc: "Launched commercial division. First major project: 200-unit apartment complex in OMR.",
  },
  {
    year: "2017",
    desc: "Introduced double-glazed and thermal-break product lines. ISO 9001 certified.",
  },
  {
    year: "2020",
    desc: "Expanded to Kerala and Andhra Pradesh. Crossed 1,500 total projects.",
  },
  {
    year: "2024",
    desc: "2,000+ projects completed. Launched smart-lock compatible door systems.",
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

export default function TimelineSection() {
  const ref = useRef<HTMLDivElement | null>(null);
  const visible = useInView(ref);

  return (
    <section
      ref={ref}
      className="px-6 md:px-10 lg:px-16 py-24 border-b border-white/10 bg-black text-white"
    >
      {/* HEADER */}
      <div
        className={`mb-20 transition-all duration-700 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <p className="text-xs tracking-[0.3em] uppercase text-white/50 mb-4">
          Our Journey
        </p>
        <h2 className="text-4xl md:text-6xl font-black tracking-tight">
          16 Years of <br />
          <span className="font-extralight italic text-white/70">Growth</span>
        </h2>
      </div>

      {/* TIMELINE GRID */}
      {/* TIMELINE GRID */}
      <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {milestones.map(({ year, desc }, i) => (
          <div
            key={year}
            className={`
        relative group p-8 border border-white/10 bg-white/5
        transition-all duration-500
        hover:bg-white/10 hover:-translate-y-2
        hover:shadow-[0_0_40px_rgba(255,255,255,0.08)]
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}
      `}
            style={{
              transitionDelay: visible ? `${i * 120}ms` : "0ms",
            }}
          >
            {/* YEAR */}
            <p className="text-5xl font-black tracking-tight text-white group-hover:text-white/90 transition-colors">
              {year}
            </p>

            {/* LINE */}
            <div className="w-12 h-px bg-white/20 my-4 group-hover:bg-white/60 transition-colors" />

            {/* DESCRIPTION */}
            <p className="text-sm text-white/60 group-hover:text-white/90 leading-relaxed transition-colors">
              {desc}
            </p>

            {/* glow overlay */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
          </div>
        ))}
      </div>
    </section>
  );
}
