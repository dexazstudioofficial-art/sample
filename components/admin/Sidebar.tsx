"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Package, FileText, Settings,
  Image, Link2, LogOut, ChevronRight,
  Users, MessageSquare, Star, BookOpen, Wrench,
} from "lucide-react";
import { useState } from "react";
import clsx from "clsx";

const NAV = [
  { label: "Dashboard",    href: "/admin/dashboard",    icon: LayoutDashboard },
  { label: "Services",     href: "/admin/services",     icon: Package         },
  { label: "Products",     href: "/admin/products",     icon: Wrench          },
  { label: "Blog",         href: "/admin/blog",         icon: BookOpen        },
  { label: "Pages",        href: "/admin/pages",        icon: FileText        },
  { label: "Media",        href: "/admin/media",        icon: Image           },
  { label: "Links",        href: "/admin/links",        icon: Link2           },
  { label: "Team",         href: "/admin/team",         icon: Users           },
  { label: "Testimonials", href: "/admin/testimonials", icon: Star            },
  { label: "Enquiries",    href: "/admin/enquiries",    icon: MessageSquare   },
  { label: "Settings",     href: "/admin/settings",     icon: Settings        },
];

export default function AdminSidebar() {
  const pathname     = usePathname();
  const router       = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try { await fetch("/api/auth/logout", { method: "POST" }); } catch {}
    router.push("/admin/login");
  }

  return (
    <aside className="w-60 shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col min-h-screen sticky top-0">
      <div className="px-5 py-5 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white flex items-center justify-center shrink-0">
            <span className="text-gray-950 text-xs font-black">SE</span>
          </div>
          <div className="leading-none">
            <p className="text-xs font-black tracking-widest text-white">SAM</p>
            <p className="text-[10px] text-gray-500 tracking-widest">CMS PANEL</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {NAV.map(({ label, href, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link key={href} href={href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 text-sm transition-colors group",
                active ? "bg-white/10 text-white font-medium" : "text-gray-400 hover:text-white hover:bg-white/5",
              )}>
              <Icon size={15} className={active ? "text-white" : "text-gray-500 group-hover:text-white"} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={12} className="text-gray-500" />}
            </Link>
          );
        })}
      </nav>

      <div className="px-2 py-3 border-t border-gray-800">
        <button onClick={handleLogout} disabled={loggingOut}
          className="flex items-center gap-3 px-3 py-2.5 w-full text-sm text-gray-400 hover:text-red-400 hover:bg-red-950/30 transition-colors">
          <LogOut size={15} />
          {loggingOut ? "Signing out…" : "Sign Out"}
        </button>
      </div>
    </aside>
  );
}
