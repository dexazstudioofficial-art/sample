"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
type FounderStat = {
  value: string;
  label: string;
};

const founderStats: FounderStat[] = [
  { value: "2,000+", label: "Projects Led" },
  { value: "20+", label: "Years Experience" },
];

function useInView(ref: React.RefObject<HTMLDivElement | null>) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );

    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, [ref]);

  return visible;
}

export default function FounderSection() {
  const ref = useRef<HTMLDivElement | null>(null);
  const visible = useInView(ref);

  return (
    <section
      ref={ref}
      className="grid grid-cols-1 lg:grid-cols-2 min-h-[80vh] border-b border-border overflow-hidden"
    >
      {/* IMAGE SIDE */}
      <div className="relative min-h-[300px] md:min-h-[400px] lg:min-h-0 overflow-hidden">
        <div
          className={`absolute inset-0 ${visible ? "animate-zoomSlow" : ""}`}
        >
          <Image
            src="/about.jpeg"
            alt="CEO Suresh Ramalingam"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover bg-black"
            priority={false}
          />
        </div>

        {/* overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* quote */}
        <div
          className={`absolute bottom-8 left-8 bg-foreground text-background p-5 max-w-xs transition-all duration-700 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <p className="text-xs leading-relaxed opacity-80 italic">
            “Quality is not a feature — it&apos;s the foundation.”
          </p>
          <p className="text-xs font-bold mt-3 tracking-wide">— Prema S.</p>
        </div>
      </div>

      {/* BIO SIDE */}
      <div className="flex flex-col justify-center px-6 md:px-10 lg:px-16 py-10 md:py-20">
        <p
          className={`label-sm mb-4 transition-all duration-700 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          Founder & CEO
        </p>

        <h2
          className={`text-3xl md:text-4xl lg:text-6xl font-black tracking-tight mb-2 transition-all duration-700 delay-100 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          Prema S.
        </h2>

        {/* <p
          className={`text-sm text-muted-foreground mb-8 tracking-wide transition-all duration-700 delay-200 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          B.E. Civil Engineering, IIT Madras · 20+ Years Experience
        </p> */}

        {/* BIO */}
        <div
          className={`space-y-4 text-sm text-muted-foreground leading-relaxed transition-all duration-700 delay-300 text-justify ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <p>
            My name is Prema.S I was born in Bangalore, Karnataka. I come from a
            poor middle-class family. I lost my mother when I was nine years
            old.
          </p>

          <p>
            I had a strong desire to study, but I had to take on
            responsibilities at home—cooking and taking care of my younger
            brothers. After two years, I stayed at my grandparent's house.
          </p>

          <p>
            My education was interrupted midway, and I got married at the age of
            18. Carrying family responsibilities and honor in my heart, I
            sacrificed my dreams and moved forward for the sake of my family.
            However, I did not gain financial independence or the respect I had
            hoped for.
          </p>

          <p>
            Over time, I realized how important education and financial
            independence are. I understood that without them, a person may not
            receive the respect they deserve, no matter how good they are.
          </p>

          <p>
            Determined to stand on my own feet, I started searching for jobs. At
            that time, TNPVC came into my life and supported me. I joined TNPVC,
            which focuses on helping ordinary and talented people move forward.
            It showed me that no one is truly poor—if you work hard, life can
            improve.
          </p>

          <p>
            I placed my trust in TNPVC and continued my journey. It never let me
            down. For the past five years, it has been guiding me with trust and
            security.
          </p>
        </div>

        {/* STATS */}
        <div
          className={`flex gap-8 mt-10 pt-8 border-t border-border transition-all duration-700 delay-500 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          {founderStats.map(({ value, label }) => (
            <div key={label}>
              <p className="text-xl md:text-2xl font-black">{value}</p>
              <p className="text-[10px] text-muted-foreground tracking-widest mt-1">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CSS ANIMATION */}
      <style jsx>{`
        @keyframes zoomSlow {
          from {
            transform: scale(1.1);
          }
          to {
            transform: scale(1.2);
          }
        }

        .animate-zoomSlow {
          animation: zoomSlow 10s ease-in-out infinite alternate;
        }
      `}</style>
    </section>
  );
}
