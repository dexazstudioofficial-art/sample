"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const values = [
  {
    number: "01",
    title: "Precision",
    description:
      "Every measurement, every cut, every installation is executed with exacting standards. We don't cut corners — we cut profiles.",
  },
  {
    number: "02",
    title: "Durability",
    description:
      "We use only Grade-A UPVC profiles rated for 30+ years of performance. Built to outlast trends and weather extremes.",
  },
  {
    number: "03",
    title: "Transparency",
    description:
      "Clear pricing, honest timelines, and no hidden costs — ever. What we quote is what you pay.",
  },
  {
    number: "04",
    title: "Sustainability",
    description:
      "UPVC is 100% recyclable. We're committed to environmentally responsible manufacturing and zero-waste fabrication.",
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

export default function ValuesSection() {
  const ref = useRef<HTMLDivElement | null>(null);
  const visible = useInView(ref);

  return (
    <section
      ref={ref}
      className="relative border-b border-border overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/about-1.png"
          alt="Architecture"
          fill
          className="object-cover scale-105"
        />
        <div className="absolute inset-0 bg-background/94" />
      </div>

      <div className="relative z-10 px-6 md:px-10 lg:px-16 py-20">
        {/* HEADER */}
        <div
          className={`mb-16 transition-all duration-700 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <p className="label-sm mb-4">Our Values</p>
          <h2 className="text-4xl md:text-6xl font-black tracking-tight text-foreground">
            What We <br />
            <span className="italic font-extralight">Stand For</span>
          </h2>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-border">
          {values.map(({ number, title, description }, i) => (
            <div
              key={number}
              className={`
                bg-background p-8 group cursor-pointer
                transition-all duration-500
                hover:bg-foreground hover:text-background
                hover:-translate-y-2 hover:shadow-2xl
              `}
              style={{
                transitionDelay: visible ? `${i * 120}ms` : "0ms",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0px)" : "translateY(20px)",
              }}
            >
              {/* NUMBER */}
              <p
                className="
                  text-5xl font-black text-border mb-6
                  transition-all duration-500
                  group-hover:text-background/20
                  group-hover:scale-110
                  origin-left
                "
              >
                {number}
              </p>

              {/* TITLE */}
              <h3 className="text-lg font-black mb-3 transition-colors duration-300">
                {title}
              </h3>

              {/* DESCRIPTION */}
              <p className="text-sm text-muted-foreground group-hover:text-background/70 leading-relaxed transition-colors duration-300">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
