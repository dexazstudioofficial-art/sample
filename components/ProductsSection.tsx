"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  Zap,
  Shield,
  Wind,
  Wrench,
  TrendingUp,
  Users,
  LucideIcon,
} from "lucide-react";

/* ------------------ Types ------------------ */
type Product = {
  title: string;
  description: string;
  image: string;
  icon: LucideIcon;
  badge: string | null;
};

const products: Product[] = [
  {
    title: "uPVC Wall Cladding",
    description:
      "Moisture-resistant uPVC wall panels that provide a clean finish, durability, and low maintenance for interiors.",
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
    icon: Zap,
    badge: "Most Popular",
  },
  {
    title: "PVC Ceiling Panels",
    description:
      "Lightweight and waterproof PVC ceiling solutions ideal for homes, offices, and commercial spaces.",
    image: "/ceiling.png",
    icon: Shield,
    badge: null,
  },
  {
    title: "uPVC Partitions",
    description:
      "Customizable partition systems for efficient space division with a sleek and modern appearance.",
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80",
    icon: Wind,
    badge: null,
  },
  {
    title: "PVC Modular Panels",
    description:
      "Versatile PVC panels suitable for decorative and functional applications across residential and commercial interiors.",
    image:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80",
    icon: Wrench,
    badge: null,
  },
  {
    title: "uPVC Maintenance Services",
    description:
      "Reliable maintenance and repair services to ensure long-term durability and consistent performance of installations.",
    image:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80",
    icon: TrendingUp,
    badge: null,
  },
  {
    title: "Design & Material Consultation",
    description:
      "Professional consultation to help you select the best PVC and uPVC materials based on your project needs.",
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80",
    icon: Users,
    badge: null,
  },
];
/* ------------------ FIXED HOOK ------------------ */
function useInView<T extends HTMLElement>(
  options?: IntersectionObserverInit,
): [React.RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

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

  return [ref, visible];
}

/* ------------------ SECTION ------------------ */
export default function ProductsSection() {
  const [ref, visible] = useInView<HTMLDivElement>({ threshold: 0.15 });

  return (
    <section className="border-b border-border bg-background">
      <div className="px-6 md:px-10 lg:px-16 py-28">
        {/* HEADER */}
        <div
          ref={ref}
          className={`mb-20 transition-all duration-1000 ease-out ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <p className="label-sm mb-4 tracking-widest opacity-70">
            What We Offer
          </p>

          <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
            Complete UPVC Solutions
            <br />
            <span className="italic font-extralight">Under One Roof</span>
          </h2>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {products.map(
            ({ title, description, image, icon: Icon, badge }, i) => (
              <div
                key={title}
                className={`group relative overflow-hidden rounded-xl border border-border bg-background shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 ${
                  visible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
                }`}
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                {/* IMAGE */}
                <div className="aspect-[4/3] overflow-hidden relative">
                  <Image
                    src={image}
                    alt={title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-all duration-500" />
                </div>

                {/* CONTENT */}
                <div className="absolute inset-0 flex flex-col justify-end p-7">
                  {badge && (
                    <span className="absolute top-5 right-5 text-[10px] font-bold uppercase bg-white text-black px-3 py-1 rounded-full">
                      {badge}
                    </span>
                  )}

                  <div className="mb-3 group-hover:translate-x-1 transition">
                    <Icon size={22} className="text-white/80" />
                  </div>

                  <h3 className="text-lg font-black text-white mb-2">
                    {title}
                  </h3>

                  <p className="text-xs text-white/70 leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
