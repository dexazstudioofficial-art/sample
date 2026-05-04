"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import EnquiryModal from "@/components/EnquiryModal";

type Product = {
  id:           string;
  name:         string;
  category:     string;
  image:        string;
  specs:        (string | { label: string; value: string })[];
  features?:    string[];
  description?: string;
  context?:     "product" | "service";
};

interface ProductModalProps {
  product: Product;
  onClose: () => void;
}

export default function ProductModal({ product, onClose }: ProductModalProps) {
  const [showEnquiry, setShowEnquiry] = useState(false);
  const context    = product.context ?? "product";
  const buttonText = context === "service" ? "Book a Service Enquiry" : "Book a Product Enquiry";

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <>
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
          onClick={onClose} aria-modal="true" role="dialog" aria-label={product.name}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="absolute inset-0 bg-foreground/60 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />

          <motion.div
            className="relative z-10 bg-background w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col md:flex-row shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 80, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 60, opacity: 0, scale: 0.96 }}>

            {/* Image */}
            <div className="relative w-full md:w-[45%] min-h-[220px] md:min-h-[260px] overflow-hidden bg-gray-100">
              {product.image && (
                <Image src={product.image} alt={product.name} fill className="object-cover" />
              )}
            </div>

            {/* Content */}
            <div className="flex flex-col p-6 md:p-10 overflow-y-auto">
              <button onClick={onClose} className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-700">
                <X size={18} />
              </button>

              <p className="text-xs uppercase text-muted-foreground mb-2">{product.category}</p>
              <h2 className="text-xl md:text-2xl font-bold mb-3">{product.name}</h2>
              <p className="text-sm text-muted-foreground mb-5">{product.description}</p>

              {/* Specs */}
              {product.specs.length > 0 && (
                <div className="mb-5">
                  <p className="text-xs uppercase mb-2 text-gray-400">Specifications</p>
                  <div className="flex flex-wrap gap-2">
                    {product.specs.map((spec, i) => (
                      <span key={`spec-${i}`} className="text-xs border px-2 py-1">
                        {typeof spec === "object" ? spec.label : spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Features */}
              {product.features && product.features.length > 0 && (
                <div className="mb-6">
                  <p className="text-xs uppercase mb-2 text-gray-400">Features</p>
                  <ul className="space-y-2">
                    {product.features.map((feat, i) => (
                      <li key={i} className="flex gap-2 text-sm">
                        <Check size={14} className="mt-0.5 shrink-0" /> {feat}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button onClick={() => setShowEnquiry(true)}
                className="mt-auto w-full py-3 bg-green-500 hover:bg-green-400 text-white font-bold text-sm uppercase tracking-wide transition-colors">
                {buttonText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {showEnquiry && (
        <EnquiryModal
          product={{
            name:        product.name,
            category:    product.category,
            image:       product.image,
            description: product.description || "",
            features:    product.features    || [],
            specs:       product.specs.map((spec) =>
              typeof spec === "object" ? `${spec.label}: ${spec.value}` : spec
            ),
            context,
          }}
          onClose={() => setShowEnquiry(false)}
        />
      )}
    </>
  );
}
