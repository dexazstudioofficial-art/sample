"use client";

import { useEffect, useRef, useState } from "react";
import { Building2, TrendingUp, Users, Award, LucideIcon } from "lucide-react";

type Stat = {
  icon: LucideIcon;
  value: number;
  suffix: string;
  label: string;
};

const stats: Stat[] = [
  { icon: Building2, value: 2000, suffix: "+", label: "Projects Completed" },
  { icon: TrendingUp, value: 15, suffix: "+", label: "Years of Excellence" },
  { icon: Users, value: 50, suffix: "+", label: "Team Members" },
  { icon: Award, value: 4, suffix: "", label: "Industry Awards" },
];

function useInView(ref: React.RefObject<HTMLDivElement | null>) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, [ref]);

  return isVisible;
}

type CountUpProps = {
  value: number;
  trigger: boolean;
};

function CountUp({ value, trigger }: CountUpProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!trigger) return;

    let start = 0;
    const duration = 1200;
    const stepTime = 16;
    const increment = value / (duration / stepTime);

    const timer = setInterval(() => {
      start += increment;

      if (start >= value) {
        start = value;
        clearInterval(timer);
      }

      setCount(Math.floor(start));
    }, stepTime);

    return () => clearInterval(timer);
  }, [trigger, value]);

  return <>{count}</>;
}

export default function AboutStats() {
  const ref = useRef<HTMLDivElement | null>(null);
  const isVisible = useInView(ref);

  return (
    <section className="bg-[#171717] text-white">
      <div
        ref={ref}
        className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10"
      >
        {stats.map(({ icon: Icon, value, suffix, label }) => (
          <div
            key={label}
            className={`flex flex-col items-center justify-center py-10 px-4 text-center transition-all duration-700
              ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-6"
              }
            `}
          >
            <Icon size={18} className="mb-3 opacity-40" aria-hidden="true" />

            <p className="text-3xl md:text-4xl font-black tracking-tight">
              <CountUp value={value} trigger={isVisible} />
              {suffix}
            </p>

            <p className="text-[10px] tracking-[0.25em] uppercase opacity-40 mt-2">
              {label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
