"use client";

import { useEffect, useRef, useState } from "react";

const steps = [
  {
    number: "01",
    title: "Book a Visit",
    description:
      "Call, WhatsApp or fill the online form. We confirm a free site visit within 24 hours at a time that suits you.",
  },
  {
    number: "02",
    title: "Site Survey",
    description:
      "Our engineer visits, measures every opening, assesses wall conditions and advises on the best product and glazing options.",
  },
  {
    number: "03",
    title: "Design & Quote",
    description:
      "You receive a detailed design proposal with samples, colour choices and a fully itemised, fixed-price quotation within 48 hours.",
  },
  {
    number: "04",
    title: "Fabrication",
    description:
      "Once approved, we begin production at our factory. Grade-A profiles, German hardware, and double-glazed units built to your spec.",
  },
  {
    number: "05",
    title: "Installation",
    description:
      "Our certified installation crew arrives on schedule, fits every unit to a weatherproof standard and leaves your space clean.",
  },
  {
    number: "06",
    title: "Handover & Care",
    description:
      "Full quality inspection, live demo of all hardware, warranty documents issued and maintenance schedule explained.",
  },
];

// 👇 scroll hook
function useInView(ref: React.RefObject<HTMLDivElement | null>) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.2 },
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);

  return visible;
}

export default function ServiceProcess() {
  const ref = useRef<HTMLDivElement | null>(null);
  const visible = useInView(ref);

  return (
    <section className="bg-black text-white border-b border-white/10 overflow-hidden">
      <div className="px-6 md:px-10 lg:px-16 py-20">
        {/* Heading */}
        <div className="mb-16">
          <p className="label-sm mb-4 text-white/40">How It Works</p>
          <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
            From First Call
            <br />
            <span className="italic font-extralight text-white/70">
              To Final Handover
            </span>
          </h2>
        </div>

        {/* Steps */}
        <div
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {steps.map(({ number, title, description }, i) => (
            <div
              key={number}
              className="group relative p-8 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:border-white/30 hover:bg-white/10 hover:shadow-[0_10px_40px_rgba(255,255,255,0.08)]"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(40px)",
                transitionDelay: `${i * 120}ms`,
              }}
            >
              {/* subtle glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-br from-white/5 via-transparent to-white/5" />

              {/* Number */}
              <p className="text-5xl font-black text-white/10 group-hover:text-white/20 mb-6 transition-all duration-300">
                {number}
              </p>

              {/* Title */}
              <h3 className="text-base font-black text-white mb-3 group-hover:tracking-wide transition-all duration-300">
                {title}
              </h3>

              {/* Description */}
              <p className="text-xs text-white/60 group-hover:text-white/80 leading-relaxed transition duration-300">
                {description}
              </p>

              {/* bottom line animation */}
              <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-white/40 group-hover:w-full transition-all duration-500" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
