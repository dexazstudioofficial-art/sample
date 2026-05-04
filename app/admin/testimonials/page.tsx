"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { Plus, Pencil, Trash2, Eye, EyeOff, X, Check, Loader2, Star } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";

interface Testimonial {
  id: string; name: string; location: string; project: string;
  quote: string; avatar: string; rating: number;
  isActive: boolean; sortOrder: number;
}

const EMPTY = { name: "", location: "", project: "", quote: "", avatar: "", rating: 5, isActive: true, sortOrder: 0 };

export default function TestimonialsPage() {
  const [items,    setItems]    = useState<Testimonial[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [editing,  setEditing]  = useState<Testimonial | null>(null);
  const [creating, setCreating] = useState(false);
  const [form,     setForm]     = useState(EMPTY);
  const [saving,   setSaving]   = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/cms/testimonials");
    setItems(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function startEdit(t: Testimonial) {
    setForm({ name: t.name, location: t.location, project: t.project, quote: t.quote,
              avatar: t.avatar, rating: t.rating, isActive: t.isActive, sortOrder: t.sortOrder });
    setEditing(t); setCreating(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const method = editing ? "PATCH" : "POST";
      const body   = editing ? { id: editing.id, ...form } : form;
      const res    = await fetch("/api/cms/testimonials", {
        method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      if (!res.ok) { toast.error("Save failed"); return; }
      toast.success(editing ? "Updated" : "Created");
      setEditing(null); setCreating(false); await load();
    } finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this testimonial?")) return;
    await fetch("/api/cms/testimonials", {
      method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }),
    });
    toast.success("Deleted"); await load();
  }

  async function toggleActive(t: Testimonial) {
    await fetch("/api/cms/testimonials", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: t.id, isActive: !t.isActive }),
    });
    await load();
  }

  const showForm = editing !== null || creating;

  return (
    <AdminShell title="Testimonials" subtitle="Manage customer reviews shown on the home page">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-400">{items.length} testimonials</p>
        <button onClick={() => { setForm(EMPTY); setEditing(null); setCreating(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-950 text-sm font-black tracking-widest uppercase hover:bg-gray-100 transition-colors">
          <Plus size={16} /> Add Testimonial
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          {loading && <p className="text-gray-500 text-center py-8">Loading…</p>}
          {items.map((t) => (
            <div key={t.id} className={`flex items-start gap-4 p-4 bg-gray-900 border ${editing?.id === t.id ? "border-white" : "border-gray-800"}`}>
              <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 bg-gray-800">
                {t.avatar && <Image src={t.avatar} alt={t.name} fill className="object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-white">{t.name}</p>
                  <div className="flex gap-0.5">{Array.from({ length: t.rating }).map((_, i) => <Star key={i} size={10} className="text-amber-400 fill-amber-400" />)}</div>
                  <span className={`text-[10px] px-1.5 py-0.5 ${t.isActive ? "bg-green-900 text-green-300" : "bg-gray-800 text-gray-500"}`}>{t.isActive ? "Active" : "Hidden"}</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{t.location} · {t.project}</p>
                <p className="text-xs text-gray-600 mt-1 line-clamp-2 italic">"{t.quote}"</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => toggleActive(t)} className="p-1.5 text-gray-500 hover:text-white transition-colors">{t.isActive ? <Eye size={14} /> : <EyeOff size={14} />}</button>
                <button onClick={() => startEdit(t)} className="p-1.5 text-gray-500 hover:text-white transition-colors"><Pencil size={14} /></button>
                <button onClick={() => handleDelete(t.id)} className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>

        {showForm && (
          <div className="bg-gray-900 border border-gray-700 p-6 space-y-4 sticky top-4 self-start">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white">{editing ? "Edit Testimonial" : "New Testimonial"}</h3>
              <button onClick={() => { setEditing(null); setCreating(false); }} className="text-gray-500 hover:text-white"><X size={16} /></button>
            </div>
            {(["name","location","project","avatar"] as const).map(k => (
              <div key={k}>
                <label className="text-xs text-gray-400 tracking-widest uppercase block mb-1.5">{k}</label>
                <input value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} className={ic} placeholder={k === "avatar" ? "https://..." : ""} />
              </div>
            ))}
            <div>
              <label className="text-xs text-gray-400 tracking-widest uppercase block mb-1.5">Quote</label>
              <textarea value={form.quote} onChange={e => setForm(f => ({ ...f, quote: e.target.value }))} rows={4} className={`${ic} resize-none`} />
            </div>
            <div>
              <label className="text-xs text-gray-400 tracking-widest uppercase block mb-1.5">Rating (1–5)</label>
              <input type="number" min={1} max={5} value={form.rating} onChange={e => setForm(f => ({ ...f, rating: parseInt(e.target.value) || 5 }))} className={ic} />
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4 accent-white" />
              <span className="text-sm text-gray-300">Active</span>
            </div>
            <button onClick={handleSave} disabled={saving} className="w-full flex items-center justify-center gap-2 py-3 bg-white text-gray-950 text-sm font-black tracking-widest uppercase disabled:opacity-50">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              {saving ? "Saving…" : (editing ? "Update" : "Create")}
            </button>
          </div>
        )}
      </div>
    </AdminShell>
  );
}

const ic = "w-full bg-gray-800 border border-gray-700 text-white text-sm px-3 py-2.5 focus:outline-none focus:border-gray-400 transition-colors placeholder:text-gray-600";
