"use client";

import Image from "next/image";
import {
  ClipboardList, Ruler, Factory, HardHat, Wrench, Headphones,
  Star, Zap, Shield, type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ServiceItem {
  id: string;
  number: string;
  title: string;
  description: string;
  image: string;
  icon: string;
  badge: string | null;
  isActive: boolean;
  sortOrder: number;
}

const ICON_MAP: Record<string, LucideIcon> = {
  ClipboardList, Ruler, Factory, HardHat, Wrench,
  Headphones, Star, Zap, Shield,
};

function resolveIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? Wrench;
}

function useInView(ref: React.RefObject<HTMLDivElement | null>) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);
  return visible;
}

export default function ServicesList() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const ref     = useRef<HTMLDivElement | null>(null);
  const visible = useInView(ref);

  useEffect(() => {
    fetch("/api/cms/services")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setServices(data.filter((s: ServiceItem) => s.isActive));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="border-b border-border">
      <div className="px-6 md:px-10 lg:px-16 py-20">
        <div className="mb-16">
          <p className="label-sm mb-4">What We Do</p>
          <h2 className="text-4xl md:text-6xl font-black tracking-tight text-foreground leading-tight">
            All Services,
            <br />
            <span className="italic font-extralight">One Trusted Team</span>
          </h2>
        </div>

        <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(({ id, number, title, description, image, icon, badge }, i) => {
            const Icon = resolveIcon(icon);
            return (
              <div key={id}
                className="group relative overflow-hidden rounded-xl border border-border bg-background cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:shadow-xl"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(40px)",
                  transitionDelay: `${i * 120}ms`,
                }}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={image || "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80"}
                    alt={title} fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-80 group-hover:opacity-100 transition duration-500" />
                </div>

                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  {badge && (
                    <span className="absolute top-4 right-4 text-[10px] font-bold tracking-widest uppercase bg-background text-foreground px-2 py-1">
                      {badge}
                    </span>
                  )}
                  <span className="text-xs font-black tracking-widest text-background/40 mb-2 group-hover:text-background/70 transition">
                    {number}
                  </span>
                  <Icon size={20} className="text-background/70 mb-3 transition-transform duration-300 group-hover:scale-125" />
                  <h3 className="text-base font-black text-background mb-2">{title}</h3>
                  <p className="text-xs text-white text-background/70 leading-relaxed opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-400">
                    {description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
