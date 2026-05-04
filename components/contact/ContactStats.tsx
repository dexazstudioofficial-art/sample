"use client";

import { useEffect, useRef, useState } from "react";

const stats = [
  { value: "24", suffix: "hrs", label: "Response Time" },
  { value: "Free", suffix: "", label: "Site Visit & Quote" },
  { value: "100", suffix: "%", label: "No-Obligation" },
];

function useInView(ref: React.RefObject<HTMLDivElement | null>) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.3 },
    );

    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, [ref]);

  return visible;
}

function useCountUp(target: number, start: boolean, duration = 1000) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!start || isNaN(target)) return;

    let startTime: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;

      const progress = Math.min((timestamp - startTime) / duration, 1);
      setValue(Math.floor(progress * target));

      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [start, target, duration]);

  return value;
}

export default function ContactStats() {
  const ref = useRef<HTMLDivElement | null>(null);
  const visible = useInView(ref);

  return (
    <section className="bg-black text-white">
      <div
        ref={ref}
        className="
          grid grid-cols-3
          divide-x divide-zinc-800
          text-center
        "
      >
        {stats.map((stat, i) => {
          const numeric = parseInt(stat.value) || 0;
          const count = useCountUp(numeric, visible, 1000 + i * 150);

          return (
            <div
              key={stat.label}
              className="
                flex flex-col items-center justify-center
                py-6 px-2
                transition-all duration-500
                hover:bg-zinc-950 hover:scale-[1.02]
              "
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(15px)",
                transitionDelay: `${i * 100}ms`,
              }}
            >
              {/* VALUE */}
              <p className="text-xl md:text-3xl font-black tracking-tight">
                {isNaN(numeric) ? (
                  stat.value
                ) : (
                  <>
                    {count}
                    {stat.suffix}
                  </>
                )}
              </p>

              {/* LABEL */}
              <p className="text-[10px] md:text-xs tracking-widest uppercase text-zinc-400 mt-2">
                {stat.label}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
