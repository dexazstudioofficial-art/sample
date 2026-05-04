"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function ProductsCTA() {
  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0 blur-xl">
        <motion.div
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="w-full h-full"
        >
          <Image
            src="https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1600&q=80"
            alt="Beautiful home"
            fill
            className="object-cover"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 1 }}
          className="absolute inset-0 bg-foreground/85"
        />
      </div>

      {/* Content */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.15 } },
        }}
        className="relative z-10 text-background px-6 md:px-10 lg:px-16 py-28 md:py-40"
      >
        <motion.p
          variants={{
            hidden: { y: 20, opacity: 0 },
            show: { y: 0, opacity: 1 },
          }}
          className="text-xs font-bold tracking-widest uppercase opacity-40 mb-6"
        >
          Ready to Start?
        </motion.p>

        <h2 className="text-6xl md:text-8xl font-black tracking-tight leading-none mb-8">
          <motion.span
            variants={{
              hidden: { y: 60, opacity: 0 },
              show: { y: 0, opacity: 1 },
            }}
            className="block"
          >
            Let&apos;s Build
          </motion.span>

          <motion.span
            variants={{
              hidden: { y: 60, opacity: 0 },
              show: { y: 0, opacity: 1 },
            }}
            className="block italic font-extralight"
          >
            Something Great.
          </motion.span>
        </h2>

        <motion.p
          variants={{
            hidden: { y: 30, opacity: 0 },
            show: { y: 0, opacity: 1 },
          }}
          className="text-base opacity-60 max-w-md mb-10"
        >
          Book a free consultation today. Our team will visit your site, take
          measurements, and provide a detailed quote — at no cost.
        </motion.p>

        <motion.div
          variants={{
            hidden: { y: 30, opacity: 0 },
            show: { y: 0, opacity: 1 },
          }}
        >
          <motion.div
            whileHover="hover"
            whileTap={{ scale: 0.97 }}
            className="inline-block"
          >
            <Link
              href="/contact"
              className="inline-flex items-center gap-3 px-10 py-5 bg-background text-foreground text-sm font-black tracking-widest uppercase hover:bg-background/90 transition-colors duration-200"
            >
              Book Free Site Visit
              <motion.span
                variants={{
                  hover: { x: 6 },
                }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <ArrowRight size={16} />
              </motion.span>
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
