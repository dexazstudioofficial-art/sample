"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { MessageSquare, CheckCheck, Mail, Phone, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface Enquiry {
  id: string;
  name: string;
  phone: string;
  email?: string;
  productName?: string;
  message: string;
  status: string;
  createdAt: string;
}

const STATUS_TABS = ["all", "new", "read", "replied"];

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [updating, setUpdating] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const q = tab !== "all" ? `?status=${tab}` : "";
    const res = await fetch(`/api/cms/enquiries${q}`);
    setEnquiries(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [tab]);

  async function updateStatus(id: string, status: string) {
    setUpdating(id);
    const res = await fetch("/api/cms/enquiries", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      toast.success(`Marked as ${status}`);
      await load();
    } else toast.error("Update failed");
    setUpdating(null);
  }

  const statusColor: Record<string, string> = {
    new: "bg-amber-900 text-amber-300",
    read: "bg-blue-900 text-blue-300",
    replied: "bg-green-900 text-green-300",
  };

  return (
    <AdminShell
      title="Enquiries"
      subtitle="Customer enquiries submitted via the website"
    >
      {/* Tabs */}
      <div className="flex gap-0 border-b border-gray-800 mb-6">
        {STATUS_TABS.map((s) => (
          <button
            key={s}
            onClick={() => setTab(s)}
            className={`px-5 py-3 text-sm capitalize border-b-2 transition-colors ${tab === s ? "border-white text-white font-medium" : "border-transparent text-gray-500 hover:text-gray-300"}`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center gap-3 py-16 text-gray-500">
          <Loader2 size={18} className="animate-spin" /> Loading…
        </div>
      ) : enquiries.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-gray-800 text-gray-600">
          <MessageSquare size={32} className="mx-auto mb-3 opacity-30" />
          No enquiries yet.
        </div>
      ) : (
        <div className="space-y-3">
          {enquiries.map((e) => (
            <div key={e.id} className="bg-gray-900 border border-gray-800 p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <p className="text-sm font-bold text-white">{e.name}</p>
                    <span
                      className={`text-[10px] px-2 py-0.5 font-bold tracking-widest uppercase ${statusColor[e.status] ?? "bg-gray-800 text-gray-400"}`}
                    >
                      {e.status}
                    </span>
                    {e.productName && (
                      <span className="text-[10px] px-2 py-0.5 bg-gray-800 text-gray-400">
                        {e.productName}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 flex-wrap text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1.5">
                      <Phone size={11} />
                      {e.phone}
                    </span>
                    {e.email && (
                      <span className="flex items-center gap-1.5">
                        <Mail size={11} />
                        {e.email}
                      </span>
                    )}
                    <span>{new Date(e.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed bg-gray-800 px-4 py-3 border-l-2 border-gray-600">
                    {e.message}
                  </p>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  {e.status !== "read" && (
                    <button
                      onClick={() => updateStatus(e.id, "read")}
                      disabled={updating === e.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-900/50 text-blue-300 hover:bg-blue-900 transition-colors border border-blue-800 disabled:opacity-50"
                    >
                      {updating === e.id ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Mail size={12} />
                      )}{" "}
                      Mark Read
                    </button>
                  )}
                  {e.status !== "replied" && (
                    <button
                      onClick={() => updateStatus(e.id, "replied")}
                      disabled={updating === e.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-green-900/50 text-green-300 hover:bg-green-900 transition-colors border border-green-800 disabled:opacity-50"
                    >
                      <CheckCheck size={12} /> Mark Replied
                    </button>
                  )}
                  <a
                    href={`https://wa.me/${e.phone.replace(/\D/g, "")}?text=Hello ${encodeURIComponent(e.name)}, thank you for your enquiry.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#25D366]/20 text-green-300 hover:bg-[#25D366]/30 transition-colors border border-green-900"
                  >
                    <MessageSquare size={12} /> Reply on WA
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
