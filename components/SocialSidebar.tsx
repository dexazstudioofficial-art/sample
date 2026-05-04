"use client";

import { usePathname } from "next/navigation";
import { useSiteSettings } from "@/lib/useSiteSettings";

// Only show on these pages
const SHOW_ON = ["/", "/about", "/contact"];

const SOCIAL_KEYS = [
  "social_instagram",
  "social_facebook",
  "social_linkedin",
  "social_youtube",
  "whatsapp_number",
];

const ICON_MAP: Record<string, { icon: string; hoverColor: string; label: string }> = {
  social_instagram: { icon: "bi bi-instagram", hoverColor: "hover:text-pink-500",  label: "Instagram" },
  social_facebook:  { icon: "bi bi-facebook",  hoverColor: "hover:text-blue-500",  label: "Facebook"  },
  social_linkedin:  { icon: "bi bi-linkedin",  hoverColor: "hover:text-blue-400",  label: "LinkedIn"  },
  social_youtube:   { icon: "bi bi-youtube",   hoverColor: "hover:text-red-500",   label: "YouTube"   },
  whatsapp_number:  { icon: "bi bi-whatsapp",  hoverColor: "hover:text-green-500", label: "WhatsApp"  },
};

function getHref(key: string, value: string): string {
  if (!value) return "#";
  if (key === "whatsapp_number") {
    const num = value.replace(/\D/g, "");
    return `https://wa.me/${num}`;
  }
  return value;
}

export default function SocialSidebar() {
  const pathname = usePathname();
  const { get }  = useSiteSettings(SOCIAL_KEYS);

  // Only render on allowed pages
  if (!SHOW_ON.includes(pathname)) return null;

  const socials = SOCIAL_KEYS
    .map((key) => {
      const value = get(key);
      if (!value) return null;
      const meta = ICON_MAP[key];
      return { key, href: getHref(key, value), ...meta };
    })
    .filter(Boolean) as { key: string; href: string; icon: string; hoverColor: string; label: string }[];

  if (socials.length === 0) return null;

  return (
    <div className="fixed top-[130px] left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-1.5 py-1 sm:px-4 sm:py-2 sm:top-[150px] bg-white/70 backdrop-blur-md rounded-full shadow-md">
      {socials.map(({ key, href, label, icon, hoverColor }) => (
        <a
          key={key}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className={`w-9 h-9 flex items-center justify-center text-black hover:scale-110 active:scale-95 ${hoverColor} transition-all duration-200`}
          style={{ WebkitTextStroke: "2px white", paintOrder: "stroke fill" }}
        >
          <i className={`${icon} text-lg`} />
        </a>
      ))}
    </div>
  );
}
