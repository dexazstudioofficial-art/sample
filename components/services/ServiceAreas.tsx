"use client";

import Image from "next/image";
import { Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const areas = [
  "Chennai & Greater Chennai",
  "Coimbatore & Tiruppur",
  "Madurai & Trichy",
  "Kochi & Ernakulam",
  "Thiruvananthapuram",
  "Salem & Namakkal",
  "Vijayawada & Guntur",
  "Hyderabad (select zones)",
];

// 👇 scroll animation hook
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

export default function ServiceAreas() {
  const ref = useRef<HTMLDivElement | null>(null);
  const visible = useInView(ref);

  return (
    <section
      ref={ref}
      className="grid grid-cols-1 lg:grid-cols-2 min-h-[60vh] border-b border-border overflow-hidden"
    >
      {/* Left: Image */}
      <div className="relative min-h-[400px] lg:min-h-0">
        <Image
          src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=900&q=80"
          alt="South India service areas"
          fill
          className={`object-cover transition-transform duration-[2000ms] ${
            visible ? "scale-100" : "scale-110"
          }`}
        />

        {/* Floating stat card */}
        <div
          className="absolute bottom-8 left-8 bg-foreground text-background p-6 transition-all duration-700"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(40px)",
          }}
        >
          <p className="text-3xl font-black">3 States</p>
          <p className="text-xs opacity-60 tracking-wide mt-1">
            Tamil Nadu · Kerala · Andhra Pradesh
          </p>
        </div>
      </div>

      {/* Right: Content */}
      <div className="flex flex-col justify-center px-6 md:px-10 lg:px-16 py-20">
        {/* Heading */}
        <div
          className="transition-all duration-700"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(40px)",
          }}
        >
          <p className="label-sm mb-4">Where We Serve</p>

          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground leading-tight mb-6">
            Serving All of
            <br />
            <span className="italic font-extralight">South India</span>
          </h2>

          <p className="text-sm text-muted-foreground leading-relaxed mb-10 max-w-md">
            With offices in Chennai, Coimbatore and Kochi, our installation
            teams cover all major cities and growing residential corridors
            across three states.
          </p>
        </div>

        {/* Area list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {areas.map((area, i) => (
            <div
              key={area}
              className="flex items-center gap-3 group transition-all duration-500 hover:translate-x-2"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(30px)",
                transitionDelay: `${i * 100}ms`, // ✨ stagger
              }}
            >
              <Check
                size={14}
                className="text-foreground shrink-0 transition-transform duration-300 group-hover:scale-125"
                aria-hidden="true"
              />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                {area}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
