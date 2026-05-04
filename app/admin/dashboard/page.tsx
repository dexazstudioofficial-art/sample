export const dynamic = "force-dynamic";
import { db } from "@/lib/db";
import AdminShell from "@/components/admin/AdminShell";
import { Package, Image, MessageSquare, Activity, BookOpen, Wrench } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const [products, services, blogs, media, enquiries, recentLogs] = await Promise.all([
    db.product.count(),
    db.serviceItem.count(),
    db.blog.count(),
    db.media.count(),
    db.enquiry.count({ where: { status: "new" } }),
    db.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { admin: { select: { name: true } } },
    }),
  ]);

  const stats = [
    { label: "Products",     value: products,  icon: Package,       href: "/admin/products",  color: "text-blue-400"    },
    { label: "Services",     value: services,  icon: Wrench,        href: "/admin/services",  color: "text-emerald-400" },
    { label: "Blog Posts",   value: blogs,     icon: BookOpen,      href: "/admin/blog",      color: "text-violet-400"  },
    { label: "Media Files",  value: media,     icon: Image,         href: "/admin/media",     color: "text-purple-400"  },
    { label: "New Enquiries",value: enquiries, icon: MessageSquare, href: "/admin/enquiries", color: "text-amber-400"   },
  ];

  return (
    <AdminShell title="Dashboard" subtitle="Welcome back. Here's what's happening.">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        {stats.map(({ label, value, icon: Icon, href, color }) => (
          <Link key={label} href={href}
            className="bg-gray-900 border border-gray-800 p-6 hover:border-gray-600 transition-colors group">
            <div className="flex items-start justify-between mb-4">
              <Icon size={20} className={`${color} opacity-80`} />
              <span className="text-[10px] text-gray-600 group-hover:text-gray-400 tracking-widest uppercase">View →</span>
            </div>
            <p className="text-3xl font-black text-white">{value}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
          </Link>
        ))}
      </div>

      <div className="mb-10">
        <h2 className="text-xs font-black tracking-widest uppercase text-gray-500 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {[
            { href: "/admin/products",  label: "+ Add Product"      },
            { href: "/admin/services",  label: "+ Add Service"      },
            { href: "/admin/blog",      label: "+ New Blog Post"    },
            { href: "/admin/media",     label: "+ Upload Media"     },
            { href: "/admin/settings",  label: "Edit Site Settings" },
            { href: "/admin/pages",     label: "Edit Page Content"  },
            { href: "/admin/enquiries", label: "View Enquiries"     },
          ].map(({ href, label }) => (
            <Link key={href} href={href}
              className="px-4 py-2.5 bg-gray-800 border border-gray-700 text-sm text-gray-300 hover:text-white hover:border-gray-500 transition-colors">
              {label}
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xs font-black tracking-widest uppercase text-gray-500 mb-4">Recent Activity</h2>
        <div className="bg-gray-900 border border-gray-800">
          {recentLogs.length === 0 && (
            <p className="px-6 py-8 text-sm text-gray-600 text-center">No activity yet.</p>
          )}
          {recentLogs.map((log, i) => (
            <div key={log.id}
              className={`flex items-center gap-4 px-6 py-4 ${i < recentLogs.length - 1 ? "border-b border-gray-800" : ""}`}>
              <Activity size={14} className="text-gray-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-sm text-white font-medium">{log.action}</span>
                <span className="text-gray-500 text-sm"> on </span>
                <span className="text-sm text-gray-300">{log.entity}</span>
                {log.entityId && <span className="text-gray-600 text-xs ml-2">#{log.entityId.slice(-6)}</span>}
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-gray-500">{log.admin.name}</p>
                <p className="text-xs text-gray-600">{new Date(log.createdAt).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
