"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaInstagram, FaFacebook, FaLinkedin, FaYoutube, FaWhatsapp } from "react-icons/fa";
import { useSiteSettings } from "@/lib/useSiteSettings";

const navLinks = [
  { href: "/",         label: "Home"     },
  { href: "/about",    label: "About Us" },
  { href: "/services", label: "Services" },
  { href: "/products", label: "Products" },
  { href: "/blog",     label: "Blog"     },
  { href: "/contact",  label: "Contact"  },
];

const SETTINGS_KEYS = [
  "phone_primary", "email_info", "address_line1", "address_line2",
  "social_instagram", "social_facebook", "social_linkedin", "social_youtube",
  "whatsapp_number",
];

function useInView(ref: React.RefObject<HTMLDivElement | null>) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);
  return visible;
}

export default function Footer() {
  const ref     = useRef<HTMLDivElement | null>(null);
  const visible = useInView(ref);
  const { get } = useSiteSettings(SETTINGS_KEYS);

  const phone     = get("phone_primary",    "+91 98765 43210");
  const email     = get("email_info",       "info@samenterprises.com");
  const addr1     = get("address_line1",    "42 Industrial Estate, Phase II");
  const addr2     = get("address_line2",    "Chennai, Tamil Nadu 600096");
  const instagram = get("social_instagram", "");
  const facebook  = get("social_facebook",  "");
  const linkedin  = get("social_linkedin",  "");
  const youtube   = get("social_youtube",   "");
  const whatsapp  = get("whatsapp_number",  "");

  const socials = [
    instagram && { href: instagram, icon: FaInstagram, label: "Instagram" },
    facebook  && { href: facebook,  icon: FaFacebook,  label: "Facebook"  },
    linkedin  && { href: linkedin,  icon: FaLinkedin,  label: "LinkedIn"  },
    youtube   && { href: youtube,   icon: FaYoutube,   label: "YouTube"   },
    whatsapp  && { href: `https://wa.me/${whatsapp.replace(/\D/g, "")}`, icon: FaWhatsapp, label: "WhatsApp" },
  ].filter(Boolean) as { href: string; icon: React.ComponentType<{ size: number; className: string }>; label: string }[];

  const fadeStyle = (delay = "0ms") => ({
    opacity:   visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(30px)",
    transition: `all 0.7s ease-out ${delay}`,
  });

  return (
    <footer className="relative text-white overflow-hidden">
      <div className="absolute inset-0 z-0 bg-[#171717]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-14 lg:px-20 py-20">
        <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-14">

          {/* BRAND */}
          <div style={fadeStyle()}>
            <div className="flex items-center gap-3 mb-6">
              <Image src="/logo.png" alt="SAM Enterprises Logo" width={70} height={70}
                className="object-contain border border-white/20 rounded-md" />
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-semibold tracking-wide">SAM</span>
                <span className="text-lg text-white/40 tracking-wide">ENTERPRISES</span>
              </div>
            </div>
            <p className="text-sm text-white/60 leading-relaxed max-w-[260px] mb-8">
              Premium UPVC and PVC products crafted for lasting performance,
              energy efficiency, and architectural elegance.
            </p>
            {socials.length > 0 && (
              <div className="flex items-center gap-5">
                {socials.map(({ href, icon: Icon, label }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                    aria-label={label} className="group transition hover:scale-110">
                    <Icon size={18} className="text-white/40 group-hover:text-white transition-all duration-300" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* NAV */}
          <div style={fadeStyle("100ms")}>
            <p className="text-sm tracking-[0.25em] text-white/30 mb-6">NAVIGATION</p>
            <ul className="space-y-3">
              {navLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href}
                    className="text-sm text-white/60 hover:text-white transition relative after:absolute after:left-0 after:-bottom-1 after:h-[1px] after:w-0 after:bg-white after:transition-all hover:after:w-full">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* PRODUCTS */}
          <div style={fadeStyle("200ms")}>
            <p className="text-sm tracking-[0.25em] text-white/30 mb-6">PRODUCTS</p>
            <ul className="space-y-3">
              {[
                { href: "/products/upvc-windows/sliding-windows",  label: "Sliding Windows"  },
                { href: "/products/upvc-windows/casement-windows", label: "Casement Windows" },
                { href: "/products/upvc-windows/fixed-windows",    label: "Fixed Windows"    },
                { href: "/products/upvc-doors/sliding-doors",      label: "Sliding Doors"    },
                { href: "/products/upvc-doors/french-doors",       label: "French Doors"     },
                { href: "/products/accessories/glass-types",       label: "Glass Types"      },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href}
                    className="text-sm text-white/60 hover:text-white transition relative after:absolute after:left-0 after:-bottom-1 after:h-[1px] after:w-0 after:bg-white after:transition-all hover:after:w-full">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CONTACT */}
          <div style={fadeStyle("300ms")}>
            <p className="text-sm tracking-[0.25em] text-white/30 mb-6">CONTACT</p>
            <ul className="space-y-5 text-sm text-white/60">
              <li className="flex gap-3">
                <FaMapMarkerAlt size={14} className="text-white/30 mt-1 shrink-0" />
                <span className="leading-relaxed">
                  {addr1}<br />{addr2}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <FaPhone size={14} className="text-white/30 shrink-0" />
                <a className="hover:text-white transition" href={`tel:${phone.replace(/\s/g, "")}`}>
                  {phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <FaEnvelope size={14} className="text-white/30 shrink-0" />
                <a className="hover:text-white transition break-all" href={`mailto:${email}`}>
                  {email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="border-t border-white/10 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-white/30 gap-3">
          <p>© {new Date().getFullYear()} SAM Enterprises. All rights reserved.</p>
          <p className="tracking-wide">
            Developed by{" "}
            <a href="https://dexaz.in" className="hover:text-white transition">Dexaz Studio</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
