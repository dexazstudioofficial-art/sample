"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import ProductModal from "./ProductModal";

interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  category: string;
  image: string;
  specs: (string | { label: string; value: string })[]; // ← CHANGED
  features?: string[];
  description?: string;
  serviceCategoryId?: string | null;
  serviceCategory?: ServiceCategory | null;
}

export default function ProductCatalogue() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [active, setActive] = useState<string>("All");
  const [selected, setSelected] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/public/products").then((r) => r.json()),
      fetch("/api/public/service-categories").then((r) => r.json()),
    ])
      .then(([prods, cats]) => {
        setProducts(Array.isArray(prods) ? prods : []);
        setCategories(Array.isArray(cats) ? cats : []);
      })
      .catch(() => { setProducts([]); setCategories([]); })
      .finally(() => setLoading(false));
  }, []);

  const activeCatIds = new Set(
    products.map((p) => p.serviceCategoryId).filter(Boolean),
  );
  const tabs = [
    "All",
    ...categories
      .filter((c) => activeCatIds.has(c.id))
      .map((c) => c.name),
  ];

  const filtered =
    active === "All"
      ? products
      : products.filter((p) => p.serviceCategory?.name === active);

  if (loading) {
    return (
      <div className="px-6 py-20 text-center text-gray-400 text-sm">
        Loading products…
      </div>
    );
  }

  return (
    <>
      {/* Tabs */}
      <div className="border-b border-border sticky top-16 md:top-20 bg-background z-30">
        <div className="px-6 md:px-10 lg:px-16">
          <div className="flex gap-0 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActive(tab)}
                className={`px-5 py-4 text-xs uppercase whitespace-nowrap ${
                  active === tab
                    ? "text-black font-bold border-b-2 border-black"
                    : "text-gray-500"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <section className="px-6 py-16">
        {filtered.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-10">
            No products in this category yet.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((product) => (
              <div
                key={product.id}
                onClick={() => setSelected(product)}
                className="cursor-pointer group border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative aspect-[4/3]">
                  <Image
                    src={product.image || "/placeholder.jpg"}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="p-4">
                  {product.serviceCategory && (
                    <p className="text-[10px] font-bold uppercase text-gray-400 mb-0.5">
                      {product.serviceCategory.name}
                    </p>
                  )}
                  <p className="text-sm text-gray-500">{product.category}</p>
                  <h3 className="font-bold mt-0.5">{product.name}</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {product.specs?.map((spec, i) => (
                      <span key={i} className="text-xs border px-2 py-1">
                        {typeof spec === "object" ? spec.label : spec} {/* ← CHANGED */}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {selected && (
        <ProductModal product={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
