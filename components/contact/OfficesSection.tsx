"use client";

import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const office = {
  city: "Chennai",
  isHQ: true,
  address:
    "42 Industrial Estate, Phase II, Ambattur, Chennai, Tamil Nadu 600096",
  phone: "+91 98765 43210",
  phoneTel: "tel:+919876543210",
  email: "info@pristinewindows.in",
  hours: "Mon–Sat, 9AM–6PM",
};

// ✅ FIX: allow null inside hook type
function useInView<T extends HTMLElement>(ref: React.RefObject<T | null>) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.2 },
    );

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [ref]);

  return visible;
}

export default function OfficesSection() {
  // ✅ keep this exactly like this
  const ref = useRef<HTMLDivElement>(null);

  const visible = useInView(ref);

  return (
    <section className="px-6 md:px-10 lg:px-16 py-20 border-b border-zinc-200 bg-white text-black">
      {/* Heading */}
      <div
        className="mb-16 transition-all duration-700 text-center"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(20px)",
        }}
      >
        <p className="text-xs tracking-[0.3em] uppercase text-zinc-500 mb-4">
          Our Location
        </p>

        <h2 className="text-4xl md:text-6xl font-black tracking-tight text-black">
          Chennai
          <br />
          <span className="italic font-extralight text-zinc-700">
            Head Office
          </span>
        </h2>
      </div>

      {/* Centered Office Card */}
      <div ref={ref} className="flex justify-center">
        <div
          className="
            bg-white p-8 max-w-md w-full
            border border-zinc-200
            transition-all duration-700
            hover:-translate-y-2 hover:shadow-xl
            hover:bg-zinc-50
          "
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(25px)",
          }}
        >
          {/* City + HQ badge */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <h3 className="text-2xl font-black text-black">{office.city}</h3>

            {office.isHQ && (
              <span className="text-xs font-black bg-black text-white px-2 py-0.5 tracking-widest uppercase">
                HQ
              </span>
            )}
          </div>

          <div className="space-y-4">
            {/* Address */}
            <div className="flex items-start gap-3">
              <MapPin size={14} className="text-zinc-500 shrink-0 mt-0.5" />
              <p className="text-xs text-zinc-600 leading-relaxed">
                {office.address}
              </p>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-3">
              <Phone size={14} className="text-zinc-500 shrink-0" />
              <a
                href={office.phoneTel}
                className="text-xs text-black hover:opacity-60 transition-opacity"
              >
                {office.phone}
              </a>
            </div>

            {/* Email */}
            <div className="flex items-center gap-3">
              <Mail size={14} className="text-zinc-500 shrink-0" />
              <a
                href={`mailto:${office.email}`}
                className="text-xs text-black hover:opacity-60 transition-opacity"
              >
                {office.email}
              </a>
            </div>

            {/* Hours */}
            <div className="flex items-center gap-3">
              <Clock size={14} className="text-zinc-500 shrink-0" />
              <p className="text-xs text-zinc-600">{office.hours}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
