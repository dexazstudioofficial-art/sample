"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, LayoutGrid } from "lucide-react";

interface Cat  { id: string; name: string; slug: string; }
interface Item { id: string; name: string; slug: string; serviceCategoryId?: string | null; serviceCatId?: string | null; }

const navLinks = [
  { href: "/",        label: "Home"    },
  { href: "/about",   label: "About"   },
  { href: "/blog",    label: "Blog"    },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [prodDropdown, setProdDropdown] = useState(false);
  const [svcDropdown,  setSvcDropdown]  = useState(false);
  const [mobileProd,   setMobileProd]   = useState(false);
  const [mobileSvc,    setMobileSvc]    = useState(false);

  const [prodCats, setProdCats] = useState<Cat[]>([]);
  const [products, setProducts] = useState<Item[]>([]);
  const [svcCats,  setSvcCats]  = useState<Cat[]>([]);
  const [svcItems, setSvcItems] = useState<Item[]>([]);

  const pathname = usePathname();
  const prodRef  = useRef<HTMLDivElement>(null);
  const svcRef   = useRef<HTMLDivElement>(null);

  const isProdActive = pathname.startsWith("/products");
  const isSvcActive  = pathname.startsWith("/services");

  useEffect(() => {
    Promise.all([
      fetch("/api/public/service-categories").then((r) => r.json()),
      fetch("/api/public/products").then((r) => r.json()),
      fetch("/api/public/service-cats").then((r) => r.json()),
      fetch("/api/public/service-items").then((r) => r.json()),
    ])
      .then(([pCats, prods, sCats, sItems]) => {
        setProdCats(Array.isArray(pCats)  ? pCats  : []);
        setProducts(Array.isArray(prods)  ? prods  : []);
        setSvcCats( Array.isArray(sCats)  ? sCats  : []);
        setSvcItems(Array.isArray(sItems) ? sItems : []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (prodRef.current && !prodRef.current.contains(e.target as Node)) setProdDropdown(false);
      if (svcRef.current  && !svcRef.current.contains(e.target as Node))  setSvcDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    setProdDropdown(false); setSvcDropdown(false); setMobileOpen(false);
  }, [pathname]);

  // prodGrouped = product categories + products → /products URLs
  const prodGrouped = prodCats.map((cat) => ({
    ...cat, items: products.filter((p) => p.serviceCategoryId === cat.id),
  })).filter((g) => g.items.length > 0);

  // svcGrouped = service categories + service items → /services URLs
  const svcGrouped = svcCats.map((cat) => ({
    ...cat, items: svcItems.filter((s) => s.serviceCatId === cat.id),
  })).filter((g) => g.items.length > 0);

  const prodCols = prodGrouped.length <= 1 ? "w-[280px]" : prodGrouped.length === 2 ? "w-[420px]" : "w-[580px]";
  const svcCols  = svcGrouped.length  <= 1 ? "w-[280px]" : svcGrouped.length  === 2 ? "w-[420px]" : "w-[580px]";
  const prodGrid = prodGrouped.length <= 1 ? "grid-cols-1" : prodGrouped.length === 2 ? "grid-cols-2" : "grid-cols-3";
  const svcGrid  = svcGrouped.length  <= 1 ? "grid-cols-1" : svcGrouped.length  === 2 ? "grid-cols-2" : "grid-cols-3";

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-10 lg:px-16">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" alt="SAM Enterprises" width={80} height={80} priority
              className="w-10 h-10 md:w-16 md:h-16" />
            <div>
              <span className="text-sm font-semibold text-black">SAM</span>
              <span className="text-sm ml-1 text-black">ENTERPRISES</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            {navLinks.slice(0, 2).map(({ href, label }) => (
              <Link key={href} href={href}
                className={`text-sm transition ${pathname === href ? "text-black font-medium" : "text-gray-600 hover:text-black"}`}>
                {label}
              </Link>
            ))}

            {/* Products Dropdown — uses prodGrouped → /products URLs */}
            <div className="relative" ref={prodRef}>
              <button onClick={() => { setProdDropdown(!prodDropdown); setSvcDropdown(false); }}
                className={`flex items-center gap-1 text-sm ${isProdActive ? "text-black font-medium" : "text-gray-600 hover:text-black"}`}>
                Products
                <ChevronDown size={14} className={`transition-transform duration-300 ${prodDropdown ? "rotate-180" : ""}`} />
              </button>
              {prodGrouped.length > 0 && (
                <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-4 bg-white border border-gray-200 shadow-xl rounded-lg transition-all duration-300 ${prodCols} ${
                  prodDropdown ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-2 scale-95 pointer-events-none"
                }`}>
                  <div className={`grid ${prodGrid} divide-x`}>
                    {prodGrouped.map(({ id, name, slug, items }) => (
                      <div key={id} className="p-5">
                        <p className="text-xs font-bold text-gray-500 mb-3 uppercase">{name}</p>
                        {items.map((p) => (
                          <Link key={p.id} href={`/products/${slug}/${p.slug}`}
                            onClick={() => setProdDropdown(false)}
                            className="block text-sm text-gray-600 hover:text-black py-1 truncate">
                            {p.name}
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-100 px-5 py-3 bg-gray-50 rounded-b-lg">
                    <Link href="/products" onClick={() => setProdDropdown(false)}
                      className="text-xs font-bold text-gray-500 hover:text-black uppercase tracking-wider">
                      View All Products →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Services Dropdown — uses svcGrouped → /services URLs */}
            <div className="relative" ref={svcRef}>
              <button onClick={() => { setSvcDropdown(!svcDropdown); setProdDropdown(false); }}
                className={`flex items-center gap-1 text-sm ${isSvcActive ? "text-black font-medium" : "text-gray-600 hover:text-black"}`}>
                Services
                <ChevronDown size={14} className={`transition-transform duration-300 ${svcDropdown ? "rotate-180" : ""}`} />
              </button>
              {svcGrouped.length > 0 && (
                <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-4 bg-white border border-gray-200 shadow-xl rounded-lg transition-all duration-300 ${svcCols} ${
                  svcDropdown ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-2 scale-95 pointer-events-none"
                }`}>
                  <div className={`grid ${svcGrid} divide-x`}>
                    {svcGrouped.map(({ id, name, slug, items }) => (
                      <div key={id} className="p-5">
                        <p className="text-xs font-bold text-gray-500 mb-3 uppercase">{name}</p>
                        {items.map((s) => (
                          <Link key={s.id} href={`/services/${slug}/${s.slug}`}
                            onClick={() => setSvcDropdown(false)}
                            className="block text-sm text-gray-600 hover:text-black py-1 truncate">
                            {s.name}
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-100 px-5 py-3 bg-gray-50 rounded-b-lg">
                    <Link href="/services" onClick={() => setSvcDropdown(false)}
                      className="text-xs font-bold text-gray-500 hover:text-black uppercase tracking-wider">
                      View All Services →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {navLinks.slice(2).map(({ href, label }) => (
              <Link key={href} href={href}
                className={`text-sm transition ${pathname === href ? "text-black font-medium" : "text-gray-600 hover:text-black"}`}>
                {label}
              </Link>
            ))}

            <Link href="/contact"
              className="px-5 py-2 bg-black text-white text-sm rounded-md hover:bg-gray-800 transition">
              Get Quote
            </Link>
          </nav>

          {/* Mobile Toggle */}
          <button className="md:hidden p-2" onClick={() => setMobileOpen(true)}>
            <Menu size={22} />
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile Drawer */}
      <div className={`fixed top-0 right-0 h-full w-[85%] max-w-sm bg-white z-50 shadow-xl transform transition-transform duration-300 flex flex-col ${
        mobileOpen ? "translate-x-0" : "translate-x-full"
      }`}>
        <div className="flex justify-between items-center px-6 py-5 border-b">
          <span className="font-semibold">Menu</span>
          <button onClick={() => setMobileOpen(false)}><X size={22} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-4">
          {navLinks.slice(0, 2).map(({ href, label }) => (
            <Link key={href} href={href} onClick={() => setMobileOpen(false)}
              className="text-sm text-gray-700 hover:text-black font-medium py-1">{label}</Link>
          ))}

          {/* Mobile Products — uses prodGrouped → /products URLs */}
          <div>
            <button onClick={() => setMobileProd(!mobileProd)}
              className="flex justify-between w-full text-sm font-medium py-1">
              Products <ChevronDown size={18} className={`transition-transform ${mobileProd ? "rotate-180" : ""}`} />
            </button>
            <div className={`transition-all duration-500 overflow-hidden ${mobileProd ? "max-h-[2000px] mt-3" : "max-h-0"}`}>
              <div className="space-y-3">
                {prodGrouped.map(({ id, name, slug, items }) => (
                  <div key={id} className="bg-gray-50 rounded-xl p-4 border">
                    <div className="flex items-center gap-2 mb-3">
                      <LayoutGrid size={14} className="text-gray-500" />
                      <p className="text-xs font-semibold text-gray-500 uppercase">{name}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      {items.map((p) => (
                        <Link key={p.id} href={`/products/${slug}/${p.slug}`}
                          onClick={() => setMobileOpen(false)}
                          className="flex justify-between text-sm text-gray-700 px-3 py-2 rounded-lg hover:bg-white transition">
                          {p.name}<span>→</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
                <Link href="/products" onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between w-full px-4 py-3 bg-black text-white text-sm font-bold rounded-xl">
                  View All Products <span>→</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Mobile Services — uses svcGrouped → /services URLs */}
          <div>
            <button onClick={() => setMobileSvc(!mobileSvc)}
              className="flex justify-between w-full text-sm font-medium py-1">
              Services <ChevronDown size={18} className={`transition-transform ${mobileSvc ? "rotate-180" : ""}`} />
            </button>
            <div className={`transition-all duration-500 overflow-hidden ${mobileSvc ? "max-h-[2000px] mt-3" : "max-h-0"}`}>
              <div className="space-y-3">
                {svcGrouped.map(({ id, name, slug, items }) => (
                  <div key={id} className="bg-gray-50 rounded-xl p-4 border">
                    <div className="flex items-center gap-2 mb-3">
                      <LayoutGrid size={14} className="text-gray-500" />
                      <p className="text-xs font-semibold text-gray-500 uppercase">{name}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      {items.map((s) => (
                        <Link key={s.id} href={`/services/${slug}/${s.slug}`}
                          onClick={() => setMobileOpen(false)}
                          className="flex justify-between text-sm text-gray-700 px-3 py-2 rounded-lg hover:bg-white transition">
                          {s.name}<span>→</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
                <Link href="/services" onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between w-full px-4 py-3 bg-gray-800 text-white text-sm font-bold rounded-xl">
                  View All Services <span>→</span>
                </Link>
              </div>
            </div>
          </div>

          {navLinks.slice(2).map(({ href, label }) => (
            <Link key={href} href={href} onClick={() => setMobileOpen(false)}
              className="text-sm text-gray-700 hover:text-black font-medium py-1">{label}</Link>
          ))}

          <Link href="/contact" onClick={() => setMobileOpen(false)}
            className="mt-2 px-5 py-3 bg-black text-white text-center rounded-xl font-medium">
            Get Quote
          </Link>
        </div>
      </div>
    </header>
  );
}
