"use client";

import { useEffect, useRef, useState } from "react";

const stats = [
  { value: "Free", label: "Site Consultation" },
  { value: "48", suffix: "hr", label: "Quote Turnaround" },
  { value: "10", suffix: "yr", label: "Structural Warranty" },
  { value: "100", suffix: "%", label: "Certified Installers" },
];

// 👇 scroll hook
function useInView(ref: React.RefObject<HTMLDivElement | null>) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.4 },
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);

  return visible;
}

// 👇 counter hook
function useCountUp(end: number, start: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;

    let startTime: number;
    const duration = 1000;

    const animate = (time: number) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / duration, 1);

      setCount(Math.floor(progress * end));

      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [end, start]);

  return count;
}

export default function ServicesStats() {
  const ref = useRef<HTMLDivElement | null>(null);
  const visible = useInView(ref);

  return (
    <section
      ref={ref}
      className="bg-foreground text-background overflow-hidden"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-background/10">
        {stats.map((item, i) => {
          const isNumber = !isNaN(Number(item.value));
          const count = useCountUp(isNumber ? Number(item.value) : 0, visible);

          return (
            <div
              key={item.label}
              className="flex flex-col items-center justify-center py-6 px-3 text-center group relative overflow-hidden transition-all duration-500 hover:bg-background/5"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(20px)",
                transitionDelay: `${i * 120}ms`,
              }}
            >
              {/* glow hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-b from-transparent via-background/5 to-transparent" />

              {/* Value */}
              <p className="text-2xl md:text-3xl font-black tracking-tight relative z-10 transition-transform duration-300 group-hover:scale-110">
                {isNumber ? count : item.value}
                {item.suffix && (
                  <span className="text-lg ml-1">{item.suffix}</span>
                )}
              </p>

              {/* Label */}
              <p className="text-[9px] md:text-[10px] tracking-widest uppercase opacity-50 mt-1 group-hover:opacity-80 transition relative z-10">
                {item.label}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
