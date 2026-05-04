"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/* ---------------- TYPES ---------------- */
type Highlight =
  | {
      value: number;
      suffix: string;
      label: string;
      static?: false;
    }
  | {
      value: string;
      suffix: string;
      label: string;
      static: true;
    };

const highlights: Highlight[] = [
  { value: 50, suffix: "+", label: "Product Range" },
  { value: 100, suffix: "%", label: "Durability" },
  { value: "PVC & UPVC", suffix: "", label: "Premium Quality", static: true },
];

/* ---------------- COUNT UP HOOK ---------------- */
function useCountUp(target: number, start: boolean) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!start) return;

    let startTime: number | undefined;
    const duration = 1200;

    function animate(time: number) {
      if (!startTime) startTime = time;

      const progress = Math.min((time - startTime) / duration, 1);
      setValue(Math.floor(progress * target));

      if (progress < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }, [start, target]);

  return value;
}

/* ---------------- IN VIEW HOOK ---------------- */
function useInView<T extends HTMLElement>(
  options?: IntersectionObserverInit,
): [React.RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [isVisible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, options);

    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, [options]);

  return [ref, isVisible];
}

/* ---------------- SMALL COUNTER ---------------- */
function AnimatedNumber({
  value,
  suffix,
  start,
}: {
  value: number | string;
  suffix: string;
  start: boolean;
}) {
  const count = useCountUp(typeof value === "number" ? value : 0, start);

  if (typeof value !== "number") {
    return <p className="text-2xl font-black text-foreground">{value}</p>;
  }

  return (
    <p className="text-2xl font-black text-foreground">
      {count}
      {suffix}
    </p>
  );
}

/* ---------------- BIG COUNTER ---------------- */
function CountUpBig({ start }: { start: boolean }) {
  const value = useCountUp(5000, start);

  return (
    <>
      <p className="text-3xl font-black">{value.toLocaleString()}+</p>
      <p className="text-xs opacity-60 tracking-wide mt-1">
        Trusted PVC & UPVC Products
      </p>
    </>
  );
}

/* ---------------- MAIN SECTION ---------------- */
export default function WhySection() {
  const [leftRef, leftVisible] = useInView<HTMLDivElement>({ threshold: 0.2 });
  const [rightRef, rightVisible] = useInView<HTMLDivElement>({
    threshold: 0.2,
  });

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 min-h-[70vh] border-b border-border overflow-hidden">
      {/* LEFT */}
      <div
        ref={leftRef}
        className={`flex flex-col justify-center px-6 md:px-10 lg:px-16 py-20 transition-all duration-1000 ease-out ${
          leftVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <p className="label-sm mb-6">Why Choose Our PVC & uPVC</p>

        <h2 className="text-4xl md:text-6xl font-black leading-tight mb-8">
          Not Just Products.
          <br />
          <span className="italic font-extralight">Complete PVC & UPVC</span>
          <br />
          Solutions.
        </h2>

        <p className="text-base text-muted-foreground leading-relaxed mb-6 max-w-lg">
          From strong PVC pipes and fittings to high-performance UPVC Products,
          our products are designed for durability, efficiency, and long-term
          reliability. Whether for construction, electrical, or everyday use, we
          deliver quality materials that stand the test of time.
        </p>

        {/* STATS */}
        <div className="flex gap-8 mt-4 pt-8 border-t border-border">
          {highlights.map((item) => (
            <div key={item.label}>
              <AnimatedNumber
                value={item.value}
                suffix={item.suffix}
                start={leftVisible}
              />
              <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT */}
      <div
        ref={rightRef}
        className={`relative min-h-[400px] overflow-hidden transition-all duration-1000 ease-out ${
          rightVisible ? "opacity-100 scale-100" : "opacity-0 scale-105"
        }`}
      >
        <Image
          src="/hero-1.png"
          alt="Hero"
          fill
          className="object-cover"
          priority
        />

        <div
          className={`absolute bottom-8 left-8 bg-foreground text-background p-6 transition-all duration-700 ${
            rightVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-6"
          }`}
        >
          <CountUpBig start={rightVisible} />
        </div>
      </div>
    </section>
  );
}
