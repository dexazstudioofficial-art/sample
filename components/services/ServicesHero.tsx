"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function ServicesHero() {
  return (
    <section className="relative min-h-[60vh] md:min-h-[70vh] flex items-end overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0 blur-xs">
        <motion.div
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="w-full h-full"
        >
          <Image
            src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1600&q=80"
            alt="Our services"
            fill
            className="object-cover"
            priority
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 1 }}
          className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full px-4 sm:px-6 md:px-10 lg:px-16 pb-10 sm:pb-12 md:pb-16">
        {/* Label */}
        <motion.p
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-xl sm:text-sm tracking-wide uppercase mb-3 sm:mb-4"
        >
          Our Services
        </motion.p>

        {/* Heading */}
        <h1 className="font-black tracking-tight text-foreground leading-none mb-4 sm:mb-6">
          <motion.span
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.7 }}
            className="block text-4xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-[9rem]"
          >
            Everything
          </motion.span>

          <motion.span
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.7 }}
            className="block italic font-extralight text-4xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-[9rem]"
          >
            You Need
          </motion.span>
        </h1>

        {/* Description */}
        <motion.p
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="text-xs sm:text-sm md:text-base max-w-sm sm:max-w-md md:max-w-xl leading-relaxed"
        >
          From free site consultation to precision fabrication, professional
          installation and long-term after-care — we handle every step so you
          don&apos;t have to.
        </motion.p>
      </div>
    </section>
  );
}
