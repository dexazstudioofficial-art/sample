"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const badges = [
  { value: "100%", label: "Water\nProof" },
  { value: "100%", label: "Termite\nFree" },
  { value: "10yr", label: "Warranty" },
];

export default function BeforeAfterSection() {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const image = "/beforeafter.png";

  const updatePos = useCallback((clientX: number) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;

    setSliderPos(Math.min(100, Math.max(0, pct)));
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    updatePos(e.clientX);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    dragging.current = true;
    updatePos(e.touches[0].clientX);
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (dragging.current) updatePos(e.clientX);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (dragging.current) updatePos(e.touches[0].clientX);
    };

    const onUp = () => {
      dragging.current = false;
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", onUp);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [updatePos]);

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 min-h-[520px] border-b border-border">
      {/* LEFT SIDE */}
      <div className="bg-black flex flex-col justify-center px-6 md:px-12 lg:px-16 py-16">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-5 bg-white/50" />
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-white/60">
            UPVC Windows & Doors — Premium Grade
          </p>
        </div>

        <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight mb-6">
          Transform Your Space
          <br />
          <span className="italic font-extralight">With Premium UPVC</span>
        </h2>

        <p className="text-sm text-white/70 leading-relaxed max-w-md mb-10">
          Upgrade from outdated wooden frames to modern, elegant UPVC windows
          and doors. Enjoy better insulation, zero maintenance, and a premium
          aesthetic that instantly elevates your space.
        </p>

        <div className="flex flex-wrap gap-4 mb-10">
          {badges.map(({ value, label }) => (
            <div
              key={label}
              className="w-20 h-20 rounded-full border border-white/30 flex flex-col items-center justify-center text-center"
            >
              <span className="text-lg font-black text-white">{value}</span>
              <span className="text-[10px] text-white/60 whitespace-pre-line">
                {label}
              </span>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/products"
            className="px-7 py-3 bg-white text-black text-xs font-black uppercase"
          >
            Explore Products
          </Link>

          <Link
            href="/contact"
            className="px-7 py-3 border border-white/40 text-white text-xs font-bold uppercase"
          >
            Get Free Quote
          </Link>
        </div>
      </div>

      {/* RIGHT SLIDER (FIXED SYNC VERSION) */}
      <div
        ref={containerRef}
        className="relative overflow-hidden select-none cursor-ew-resize touch-none w-full min-h-[320px] sm:min-h-[420px] lg:min-h-full"
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
      >
        {/* BASE IMAGE (COLOR) */}
        <Image src={image} alt="After" fill className="object-cover" />

        {/* OVERLAY (BLACK & WHITE USING CLIPPATH - FIXED SYNC) */}
        <div
          className="absolute inset-0"
          style={{
            clipPath: `inset(0 ${100 - sliderPos}% 0 0)`,
          }}
        >
          <Image
            src={image}
            alt="Before"
            fill
            className="object-cover grayscale contrast-110 brightness-90"
          />
        </div>

        {/* DIVIDER */}
        <div
          className="absolute top-0 bottom-0 w-[2px] bg-white/80 z-10"
          style={{ left: `${sliderPos}%` }}
        />

        {/* HANDLE */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md text-black font-bold"
          style={{ left: `${sliderPos}%` }}
        >
          ⇆
        </div>

        {/* LABELS */}
        <span className="absolute top-4 left-4 text-xs bg-black text-white px-2 py-1">
          Before
        </span>

        <span className="absolute top-4 right-4 text-xs bg-white text-black px-2 py-1">
          After
        </span>

        {/* HINT */}
        <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-white bg-black/40 px-3 py-1">
          Drag to compare
        </p>
      </div>
    </section>
  );
}
