"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { Plus, Pencil, Trash2, Eye, EyeOff, X, Check, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface ServiceCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  isActive: boolean;
  sortOrder: number;
  _count?: { products: number };
}

type CatForm = Omit<ServiceCategory, "id" | "_count">;

const EMPTY: CatForm = {
  slug: "", name: "", description: "", icon: "", isActive: true, sortOrder: 0,
};

const ic = "w-full bg-gray-800 border border-gray-700 text-white text-sm px-3 py-2.5 focus:outline-none focus:border-gray-400 transition-colors placeholder:text-gray-600";

export default function ServiceCategoriesPage() {
  const [cats,    setCats]    = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ServiceCategory | null>(null);
  const [creating,setCreating]= useState(false);
  const [form,    setForm]    = useState<CatForm>(EMPTY);
  const [saving,  setSaving]  = useState(false);
  const [deleting,setDeleting]= useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/cms/service-categories");
    setCats(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function startEdit(c: ServiceCategory) {
    setForm({ slug: c.slug, name: c.name, description: c.description, icon: c.icon, isActive: c.isActive, sortOrder: c.sortOrder });
    setEditing(c);
    setCreating(false);
  }

  function startCreate() {
    setForm(EMPTY);
    setEditing(null);
    setCreating(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const method = editing ? "PATCH" : "POST";
      const body   = editing ? { id: editing.id, ...form } : form;
      const res    = await fetch("/api/cms/service-categories", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) { toast.error((await res.json()).error || "Save failed"); return; }
      toast.success(editing ? "Category updated" : "Category created");
      setEditing(null); setCreating(false);
      await load();
    } finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this category? Products in it will become uncategorised.")) return;
    setDeleting(id);
    const res = await fetch("/api/cms/service-categories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) { toast.success("Deleted"); await load(); }
    else          toast.error("Delete failed");
    setDeleting(null);
  }

  async function toggleActive(c: ServiceCategory) {
    await fetch("/api/cms/service-categories", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: c.id, isActive: !c.isActive }),
    });
    await load();
  }

  const showForm = editing !== null || creating;

  return (
    <AdminShell title="Service Categories" subtitle="Top-level product groupings (UPVC Windows, UPVC Doors, Accessories…)">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-400">{cats.length} categories</p>
        <button onClick={startCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-950 text-sm font-black tracking-widest uppercase hover:bg-gray-100 transition-colors">
          <Plus size={16} /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LIST */}
        <div className="space-y-2">
          {loading && <p className="text-gray-500 py-8 text-center">Loading…</p>}
          {!loading && cats.length === 0 && (
            <div className="text-center py-12 text-gray-600 border border-dashed border-gray-800">
              No categories yet. Create one to start organising products.
            </div>
          )}
          {cats.map((c) => (
            <div key={c.id}
              className={`flex items-start gap-4 p-4 bg-gray-900 border ${editing?.id === c.id ? "border-white" : "border-gray-800"} hover:border-gray-600 transition-colors`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-bold text-white">{c.name}</p>
                  <span className="text-[10px] text-gray-500">/{c.slug}</span>
                  {c._count !== undefined && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-gray-800 text-gray-400">
                      {c._count.products} products
                    </span>
                  )}
                  <span className={`text-[10px] px-1.5 py-0.5 ${c.isActive ? "bg-green-900 text-green-300" : "bg-gray-800 text-gray-500"}`}>
                    {c.isActive ? "Active" : "Hidden"}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1 truncate">{c.description}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => toggleActive(c)} className="p-1.5 text-gray-500 hover:text-white">
                  {c.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <button onClick={() => startEdit(c)} className="p-1.5 text-gray-500 hover:text-white">
                  <Pencil size={14} />
                </button>
                <button onClick={() => handleDelete(c.id)} disabled={deleting === c.id}
                  className="p-1.5 text-gray-500 hover:text-red-400">
                  {deleting === c.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* FORM */}
        {showForm && (
          <div className="bg-gray-900 border border-gray-700 p-6 space-y-5 sticky top-4 self-start max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white">{editing ? "Edit Category" : "New Category"}</h3>
              <button onClick={() => { setEditing(null); setCreating(false); }} className="text-gray-500 hover:text-white">
                <X size={16} />
              </button>
            </div>

            {[
              { key: "name",        label: "Name",        placeholder: "e.g. UPVC Windows" },
              { key: "slug",        label: "Slug (URL)",  placeholder: "e.g. upvc-windows"  },
              { key: "icon",        label: "Icon Name",   placeholder: "e.g. LayoutGrid"    },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="text-xs text-gray-400 tracking-widest uppercase block mb-1.5">{label}</label>
                <input value={String((form as Record<string, unknown>)[key] ?? "")}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder} className={ic} />
              </div>
            ))}

            <div>
              <label className="text-xs text-gray-400 tracking-widest uppercase block mb-1.5">Description</label>
              <textarea value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3} className={`${ic} resize-none`} />
            </div>

            <div>
              <label className="text-xs text-gray-400 tracking-widest uppercase block mb-1.5">Sort Order</label>
              <input type="number" value={form.sortOrder}
                onChange={(e) => setForm((f) => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))}
                className={ic} />
            </div>

            <div className="flex items-center gap-3">
              <input type="checkbox" id="active" checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                className="w-4 h-4 accent-white" />
              <label htmlFor="active" className="text-sm text-gray-300">Active (visible on site)</label>
            </div>

            <button onClick={handleSave} disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-3 bg-white text-gray-950 text-sm font-black tracking-widest uppercase hover:bg-gray-100 transition-colors disabled:opacity-50">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              {saving ? "Saving…" : editing ? "Update Category" : "Create Category"}
            </button>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
