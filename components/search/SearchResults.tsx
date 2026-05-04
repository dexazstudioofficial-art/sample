"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, X, Package, Wrench } from "lucide-react";

interface SearchResult {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  type: "product" | "service";
  url: string;
  serviceCategory?: { name: string; slug: string } | null;
  category?: string;
}

interface SearchResponse {
  products: SearchResult[];
  services: SearchResult[];
  total: number;
}

export default function SearchResults() {
  const searchParams  = useSearchParams();
  const router        = useRouter();
  const initialQ      = searchParams.get("q") || "";
  const initialType   = searchParams.get("type") || "all";

  const [query,    setQuery]    = useState(initialQ);
  const [type,     setType]     = useState(initialType);
  const [results,  setResults]  = useState<SearchResponse | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = useCallback(async (q: string, t: string) => {
    if (q.trim().length < 2) { setResults(null); setSearched(false); return; }
    setLoading(true);
    setSearched(true);
    try {
      const res  = await fetch(`/api/public/search?q=${encodeURIComponent(q)}&type=${t}`);
      const data = await res.json();
      setResults(data);
    } catch {
      setResults({ products: [], services: [], total: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      doSearch(query, type);
      // Update URL
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (type !== "all") params.set("type", type);
      router.replace(`/search?${params.toString()}`, { scroll: false });
    }, 350);
    return () => clearTimeout(timer);
  }, [query, type, doSearch, router]);

  // Initial search on mount
  useEffect(() => {
    if (initialQ) doSearch(initialQ, initialType);
  }, []);

  const allResults = [
    ...(results?.products || []),
    ...(results?.services || []),
  ];

  return (
    <section className="px-6 md:px-10 lg:px-16 py-16 max-w-5xl mx-auto">
      {/* Heading */}
      <div className="mb-10">
        <p className="text-xs tracking-widest uppercase text-gray-400 mb-3">Search</p>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight">
          Find What You
          <br />
          <span className="italic font-extralight">Need</span>
        </h1>
      </div>

      {/* Search input */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, services…"
            className="w-full pl-11 pr-10 py-4 border border-border bg-background text-foreground text-sm focus:outline-none focus:border-foreground transition-colors"
            autoFocus
          />
          {query && (
            <button
              onClick={() => { setQuery(""); setResults(null); setSearched(false); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-foreground"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Type filter */}
      <div className="flex gap-2 mb-10">
        {[
          { id: "all",      label: "All"      },
          { id: "products", label: "Products" },
          { id: "services", label: "Services" },
        ].map(({ id, label }) => (
          <button key={id} onClick={() => setType(id)}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border transition-colors ${
              type === id
                ? "bg-foreground text-background border-foreground"
                : "border-border text-gray-500 hover:text-foreground"
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-16 text-gray-400 text-sm">Searching…</div>
      )}

      {/* No results */}
      {!loading && searched && results?.total === 0 && (
        <div className="text-center py-16">
          <p className="text-lg font-bold mb-2">No results for "{query}"</p>
          <p className="text-sm text-gray-400">Try different keywords or browse our products.</p>
          <Link href="/products" className="inline-block mt-6 px-6 py-3 bg-foreground text-background text-sm font-bold">
            Browse All Products
          </Link>
        </div>
      )}

      {/* Empty state */}
      {!loading && !searched && (
        <div className="text-center py-16 text-gray-400">
          <Search size={40} className="mx-auto mb-4 opacity-30" />
          <p className="text-sm">Type at least 2 characters to search</p>
        </div>
      )}

      {/* Results */}
      {!loading && allResults.length > 0 && (
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-6">
            {results?.total} result{results?.total !== 1 ? "s" : ""} for "{query}"
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            {allResults.map((item) => (
              <Link key={item.id} href={item.url}
                className="flex gap-4 p-4 border border-border hover:border-foreground transition-colors group">
                <div className="relative w-20 h-20 shrink-0 bg-gray-100 overflow-hidden">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {item.type === "product"
                        ? <Package size={20} className="text-gray-300" />
                        : <Wrench size={20} className="text-gray-300" />}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 ${
                      item.type === "product"
                        ? "bg-blue-50 text-blue-600"
                        : "bg-green-50 text-green-600"
                    }`}>
                      {item.type}
                    </span>
                    {item.serviceCategory && (
                      <span className="text-[10px] text-gray-400">{item.serviceCategory.name}</span>
                    )}
                  </div>
                  <h3 className="font-bold text-sm group-hover:text-gray-600 transition-colors">{item.name}</h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
