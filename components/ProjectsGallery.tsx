"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const projects = [
  {
    image:
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600&q=80",
    title: "ECR Villa",
    tag: "Residential",
  },
  {
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80",
    title: "OMR Tech Park",
    tag: "Commercial",
  },
  {
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80",
    title: "Anna Nagar Apartment",
    tag: "Residential",
  },
  {
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
    title: "Velachery Duplex",
    tag: "Residential",
  },
  {
    image:
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600&q=80",
    title: "T Nagar Showroom",
    tag: "Commercial",
  },
  {
    image:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80",
    title: "Adyar Bungalow",
    tag: "Residential",
  },
];

/* ---------------- Scroll ---------------- */
function useInView() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 },
    );

    if (ref.current) obs.observe(ref.current);

    return () => obs.disconnect();
  }, []);

  return [ref, visible] as const;
}

export default function ProjectsGallery() {
  const [ref, visible] = useInView();

  return (
    <section className="border-b border-border bg-muted/10">
      <div className="px-6 md:px-10 lg:px-16 py-20">
        {/* HEADER */}
        <div
          className={`flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 transition-all duration-500
          ${visible ? "opacity-100" : "opacity-0"}`}
        >
          <div>
            <p className="label-sm mb-4">Our Work</p>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight text-foreground leading-tight">
              Featured
              <br />
              <span className="italic font-extralight">Projects</span>
            </h2>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm font-semibold border-b border-foreground pb-0.5"
          >
            View All Products
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* GRID (MORE SPACE + RADIUS ADDED) */}
        <div
          ref={ref}
          className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-10"
        >
          {projects.map(({ image, title, tag }, i) => (
            <div
              key={title}
              className={`group relative overflow-hidden cursor-pointer transition-all duration-500 rounded-xl
              ${visible ? "opacity-100" : "opacity-0"}`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className="aspect-square overflow-hidden relative rounded-xl">
                <Image
                  src={image}
                  alt={title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />

                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300" />
              </div>

              <div className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-[10px] font-bold tracking-widest uppercase text-white/60 mb-1">
                  {tag}
                </span>
                <p className="text-sm font-black text-white">{title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
