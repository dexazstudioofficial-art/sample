"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function ProductsHero() {
  return (
    <section className="relative min-h-[70vh] flex items-end overflow-hidden">
      <div className="absolute inset-0 z-0 blur-xs">
        {/* Background zoom + fade */}
        <motion.div
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="w-full h-full"
        >
          <Image
            src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&q=80"
            alt="UPVC Windows"
            fill
            className="object-cover"
            priority
          />
        </motion.div>

        {/* Gradient fade */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 1 }}
          className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent"
        />
      </div>

      <div className="relative z-10 w-full px-6 md:px-10 lg:px-16 pb-16">
        {/* Label */}
        <motion.p
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="label-sm mb-4"
        >
          Our Products
        </motion.p>

        {/* Heading */}
        <h1 className="text-6xl md:text-8xl lg:text-[9rem] font-black tracking-tight text-foreground leading-none mb-6">
          <motion.span
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.7 }}
            className="block"
          >
            UPVC Windows
          </motion.span>

          <motion.span
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.7 }}
            className="block italic font-extralight"
          >
            &amp; Doors
          </motion.span>
        </h1>

        {/* Description */}
        <motion.p
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="text-sm max-w-xl leading-relaxed"
        >
          Every product is custom-fabricated to your specifications using
          premium Grade-A UPVC profiles and European hardware.
        </motion.p>
      </div>
    </section>
  );
}
