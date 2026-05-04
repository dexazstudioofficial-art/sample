"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const guarantees = [
  {
    number: "01",
    title: "Fixed Pricing",
    description:
      "The price we quote is the price you pay. No surprise charges, no change orders — ever.",
  },
  {
    number: "02",
    title: "On-Time Delivery",
    description:
      "We commit to a start and finish date before work begins and honour it with daily progress updates.",
  },
  {
    number: "03",
    title: "Certified Workmanship",
    description:
      "Every installer is UPVC-certified and background-checked. We stand behind every joint and seal.",
  },
  {
    number: "04",
    title: "10-Year Warranty",
    description:
      "Full structural warranty on all profiles. Hardware and glass covered for 5 years — in writing.",
  },
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

export default function ServiceGuarantees() {
  const ref = useRef<HTMLDivElement | null>(null);
  const visible = useInView(ref);

  return (
    <section className="relative border-b border-border overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0 blur-xs">
        <Image
          src="/foot.jpeg"
          alt="Our guarantees"
          fill
          className={`object-cover transition-transform duration-[2000ms] ${
            visible ? "scale-100" : "scale-110"
          }`}
        />
        <div className="absolute inset-0 bg-background/94" />
      </div>

      <div className="relative z-10 px-6 md:px-10 lg:px-16 py-20">
        {/* Heading */}
        <div
          ref={ref}
          className="mb-16 transition-all duration-700"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(40px)",
          }}
        >
          <p className="label-sm mb-4">Our Guarantees</p>

          <h2 className="text-4xl md:text-6xl font-black tracking-tight text-foreground">
            We Don&apos;t Just
            <br />
            <span className="italic font-extralight">Promise — We Deliver</span>
          </h2>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-border">
          {guarantees.map(({ number, title, description }, i) => (
            <div
              key={number}
              className="bg-background p-8 group transition-all duration-500 hover:bg-foreground hover:text-background hover:-translate-y-2 hover:shadow-xl"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(40px)",
                transitionDelay: `${i * 120}ms`, // ✨ stagger effect
              }}
            >
              <p className="text-5xl font-black text-border group-hover:text-background/20 mb-6 transition-all duration-300">
                {number}
              </p>

              <h3 className="text-lg font-black text-foreground group-hover:text-background mb-3 transition-colors duration-300">
                {title}
              </h3>

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
