"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

interface Testimonial {
  id: string;
  name: string;
  location: string;
  project: string;
  quote: string;
  avatar: string;
  rating: number;
}

function StarRating({ count = 5 }: { count?: number }) {
  return (
    <div className="flex gap-1 mb-6">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
      ))}
    </div>
  );
}

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    fetch("/api/public/testimonials")
      .then((r) => r.json())
      .then((data) => setTestimonials(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  if (testimonials.length === 0) return null;

  return (
    <section className="bg-[#171717] text-white border-b border-white/10">
      <div className="px-6 md:px-10 lg:px-16 py-20 md:py-24">
        <div className="mb-14 md:mb-16 text-center md:text-left">
          <p className="text-xs font-bold tracking-widest uppercase text-white/50 mb-3">
            What Clients Say
          </p>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black leading-tight">
            Trusted by
            <br />
            <span className="italic font-light text-white/70">2,000+ Families</span>
          </h2>
        </div>

        <Swiper
          modules={[Pagination, Autoplay, FreeMode]}
          pagination={{ clickable: true }}
          loop={true}
          centeredSlides={true}
          autoplay={{ delay: 0, disableOnInteraction: false, pauseOnMouseEnter: true }}
          speed={5000}
          freeMode={{ enabled: true, momentum: false }}
          spaceBetween={20}
          breakpoints={{
            0:    { slidesPerView: 1   },
            640:  { slidesPerView: 1.2 },
            768:  { slidesPerView: 2   },
            1280: { slidesPerView: 3   },
          }}
          className="py-8 md:py-10"
        >
          {testimonials.map((t) => (
            <SwiperSlide key={t.id} className="!h-auto">
              <div className="h-full p-6 md:p-8 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 transition-all duration-300 scale-95 opacity-80 hover:scale-105 hover:opacity-100 hover:bg-white/10">
                <StarRating count={t.rating} />
                <p className="text-sm md:text-base leading-relaxed text-white/80 mb-6 italic md:text-justify text-left">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-4">
                  {t.avatar ? (
                    <Image src={t.avatar} alt={t.name} width={44} height={44}
                      className="rounded-full object-cover w-11 h-11" />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
                      {t.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-white/60">{t.location}</p>
                  </div>
                </div>
                {t.project && (
                  <p className="text-[10px] tracking-widest uppercase text-white/40 mt-4 pt-4 border-t border-white/10">
                    {t.project}
                  </p>
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
