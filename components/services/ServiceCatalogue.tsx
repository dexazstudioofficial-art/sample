"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface ServiceCat {
  id: string;
  name: string;
  slug: string;
}

interface ServiceItem {
  id: string;
  slug:string;
  name: string;
  category: string;
  image: string;
  description: string;
  specs: (string | { label: string; value: string })[];
  serviceCatId?: string | null;
  serviceCat?: ServiceCat | null;
}

export default function ServiceCatalogue() {
  const [items,      setItems]      = useState<ServiceItem[]>([]);
  const [cats,       setCats]       = useState<ServiceCat[]>([]);
  const [active,     setActive]     = useState("All");
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/public/service-items").then((r) => r.json()),
      fetch("/api/public/service-cats").then((r) => r.json()),
    ])
      .then(([serviceItems, serviceCats]) => {
        setItems(Array.isArray(serviceItems) ? serviceItems : []);
        setCats(Array.isArray(serviceCats)   ? serviceCats  : []);
      })
      .catch(() => { setItems([]); setCats([]); })
      .finally(() => setLoading(false));
  }, []);

  const activeCatIds = new Set(items.map((p) => p.serviceCatId).filter(Boolean));
  const tabs = [
    "All",
    ...cats.filter((c) => activeCatIds.has(c.id)).map((c) => c.name),
  ];

  const filtered =
    active === "All"
      ? items
      : items.filter((p) => p.serviceCat?.name === active);

  if (loading) {
    return (
      <div className="px-6 py-20 text-center text-gray-400 text-sm">
        Loading services…
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
              <button key={tab} onClick={() => setActive(tab)}
                className={`px-5 py-4 text-xs uppercase whitespace-nowrap ${
                  active === tab ? "text-black font-bold border-b-2 border-black" : "text-gray-500"
                }`}>
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
            No services in this category yet.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item) => (
              <Link
                key={item.id}
                href={`/services/${item.serviceCat?.slug ?? "services"}/${item.slug}`}
                className="group border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative aspect-[4/3] bg-gray-100">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                      No Image
                    </div>
                  )}
                </div>
                <div className="p-4">
                  {item.serviceCat && (
                    <p className="text-[10px] font-bold uppercase text-gray-400 mb-0.5">
                      {item.serviceCat.name}
                    </p>
                  )}
                  <p className="text-sm text-gray-500">{item.category}</p>
                  <h3 className="font-bold mt-0.5">{item.name}</h3>
                  {item.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
