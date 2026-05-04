"use client";

import { useEffect, useState, useCallback } from "react";
import AdminShell from "@/components/admin/AdminShell";
import {
  Plus, Pencil, Trash2, Eye, EyeOff, X, Check,
  Loader2, FolderPlus,
} from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";

interface ServiceCategory {
  id: string; slug: string; name: string;
  description: string; icon: string;
  isActive: boolean; sortOrder: number;
  _count?: { products: number };
}

interface Product {
  id: string; slug: string; name: string; category: string;
  subCategory: string; serviceCategoryId: string | null;
  serviceCategory?: ServiceCategory | null;
  description: string; image: string;
  specs: string[]; features: string[];
  isActive: boolean; sortOrder: number;
  variants: { id: string; name: string; image: string; tags: string[]; description: string }[];
}

type ProductForm = Omit<Product, "id" | "variants" | "serviceCategory">;
type CatForm = { name: string; slug: string; description: string; icon: string; isActive: boolean; sortOrder: number };

const EMPTY_PRODUCT: ProductForm = {
  slug: "", name: "", category: "", subCategory: "",
  serviceCategoryId: null, description: "", image: "",
  specs: [], features: [], isActive: true, sortOrder: 0,
};
const EMPTY_CAT: CatForm = { name: "", slug: "", description: "", icon: "", isActive: true, sortOrder: 0 };
const ic = "w-full bg-gray-800 border border-gray-700 text-white text-sm px-3 py-2.5 focus:outline-none focus:border-gray-400 transition-colors placeholder:text-gray-600";

export default function ProductsAdminPage() {
  const [products,   setProducts]   = useState<Product[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [filterCat,  setFilterCat]  = useState("all");

  const [editing,  setEditing]  = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [form,     setForm]     = useState<ProductForm>(EMPTY_PRODUCT);
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Inline category state (inside product form)
  const [showInlineCat,    setShowInlineCat]    = useState(false);
  const [inlineCatForm,    setInlineCatForm]    = useState<CatForm>(EMPTY_CAT);
  const [savingInlineCat,  setSavingInlineCat]  = useState(false);
  const [editingCat,       setEditingCat]       = useState<ServiceCategory | null>(null);
  const [showEditCat,      setShowEditCat]       = useState(false);
  const [catForm,          setCatForm]           = useState<CatForm>(EMPTY_CAT);
  const [savingCat,        setSavingCat]         = useState(false);
  const [deletingCat,      setDeletingCat]       = useState<string | null>(null);

  const loadCategories = useCallback(async (): Promise<ServiceCategory[]> => {
    try {
      const res  = await fetch("/api/cms/service-categories", { cache: "no-store" });
      const data = await res.json();
      const cats = Array.isArray(data) ? data : [];
      setCategories(cats);
      return cats;
    } catch { toast.error("Failed to load categories"); return []; }
  }, []);

  const loadProducts = useCallback(async () => {
    try {
      const res  = await fetch("/api/cms/products", { cache: "no-store" });
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch { toast.error("Failed to load products"); }
  }, []);

  async function load() {
    setLoading(true);
    await Promise.all([loadProducts(), loadCategories()]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  // ── Product actions ──────────────────────────────────
  function startEdit(p: Product) {
    setForm({ slug: p.slug, name: p.name, category: p.category,
      subCategory: p.subCategory, serviceCategoryId: p.serviceCategoryId,
      description: p.description, image: p.image,
      specs: p.specs, features: p.features,
      isActive: p.isActive, sortOrder: p.sortOrder });
    setEditing(p); setCreating(false);
    setShowInlineCat(false); setShowEditCat(false);
  }

  function startCreate() {
    setForm({ ...EMPTY_PRODUCT, serviceCategoryId: categories[0]?.id ?? null });
    setEditing(null); setCreating(true);
    setShowInlineCat(false); setShowEditCat(false);
  }

  function closeForm() {
    setEditing(null); setCreating(false);
    setShowInlineCat(false); setShowEditCat(false);
  }

  function handleCategorySelect(catId: string) {
    const cat = categories.find((c) => c.id === catId);
    setForm((f) => ({ ...f, serviceCategoryId: catId || null, category: f.category || cat?.name || "" }));
  }

  async function handleSaveProduct() {
    if (!form.serviceCategoryId) { toast.error("Please select a Service Category"); return; }
    if (!form.name.trim())       { toast.error("Product name is required");          return; }
    if (!form.slug.trim())       { toast.error("Slug is required");                  return; }
    if (!form.category.trim())   { toast.error("Category label is required");        return; }

    setSaving(true);
    try {
      const url    = editing ? `/api/cms/products/${editing.id}` : "/api/cms/products";
      const method = editing ? "PATCH" : "POST";
      const res    = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data   = await res.json();
      if (!res.ok) { toast.error(typeof data.error === "string" ? data.error : "Save failed"); return; }
      toast.success(editing ? "Product updated" : "Product created");
      closeForm();
      await Promise.all([loadProducts(), loadCategories()]);
    } catch { toast.error("Network error");
    } finally { setSaving(false); }
  }

  async function handleDeleteProduct(id: string) {
    if (!confirm("Delete this product?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/cms/products/${id}`, { method: "DELETE" });
      if (res.ok) { toast.success("Deleted"); await Promise.all([loadProducts(), loadCategories()]); }
      else toast.error("Delete failed");
    } catch { toast.error("Network error");
    } finally { setDeleting(null); }
  }

  async function toggleActive(p: Product) {
    await fetch(`/api/cms/products/${p.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !p.isActive }),
    });
    await loadProducts();
  }

  // ── Inline create category ───────────────────────────
  function openInlineCat() {
    setInlineCatForm({ ...EMPTY_CAT, sortOrder: categories.length + 1 });
    setShowInlineCat(true); setShowEditCat(false);
  }

  async function handleSaveInlineCat() {
    if (!inlineCatForm.name.trim()) { toast.error("Name required"); return; }
    if (!inlineCatForm.slug.trim()) { toast.error("Slug required");  return; }
    setSavingInlineCat(true);
    try {
      const res  = await fetch("/api/cms/service-categories", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(inlineCatForm) });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Failed"); return; }
      toast.success(`Category "${data.name}" created`);
      setShowInlineCat(false); setInlineCatForm(EMPTY_CAT);
      const updatedCats = await loadCategories();
      const newCat = updatedCats.find((c) => c.id === data.id) ?? data;
      setForm((f) => ({ ...f, serviceCategoryId: newCat.id, category: f.category || newCat.name }));
    } catch { toast.error("Network error");
    } finally { setSavingInlineCat(false); }
  }

  // ── Inline edit category ─────────────────────────────
  function openEditCat(cat: ServiceCategory) {
    setCatForm({ name: cat.name, slug: cat.slug, description: cat.description,
      icon: cat.icon, isActive: cat.isActive, sortOrder: cat.sortOrder });
    setEditingCat(cat); setShowEditCat(true); setShowInlineCat(false);
  }

  async function handleSaveCat() {
    if (!catForm.name.trim()) { toast.error("Name required"); return; }
    setSavingCat(true);
    try {
      const res  = await fetch("/api/cms/service-categories", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingCat!.id, ...catForm }) });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Failed"); return; }
      toast.success("Category updated");
      setShowEditCat(false); setEditingCat(null);
      await loadCategories();
    } catch { toast.error("Network error");
    } finally { setSavingCat(false); }
  }

  async function handleDeleteCat(cat: ServiceCategory) {
    const count = cat._count?.products ?? 0;
    if (!confirm(`Delete "${cat.name}"?${count > 0 ? ` ${count} products will become uncategorised.` : ""}`)) return;
    setDeletingCat(cat.id);
    try {
      const res = await fetch("/api/cms/service-categories", {
        method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: cat.id }) });
      if (res.ok) {
        toast.success("Deleted");
        if (filterCat === cat.id) setFilterCat("all");
        await Promise.all([loadCategories(), loadProducts()]);
      } else toast.error("Delete failed");
    } catch { toast.error("Network error");
    } finally { setDeletingCat(null); }
  }

  const filtered = filterCat === "all" ? products : products.filter((p) => p.serviceCategoryId === filterCat);
  const showForm  = editing !== null || creating;

  return (
    <AdminShell title="Products" subtitle="Manage products and their service categories">
      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        <button onClick={() => setFilterCat("all")}
          className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border transition-colors ${filterCat === "all" ? "bg-white text-gray-950 border-white" : "border-gray-700 text-gray-400 hover:text-white"}`}>
          All ({products.length})
        </button>
        {categories.map((c) => (
          <button key={c.id} onClick={() => setFilterCat(c.id)}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border transition-colors ${filterCat === c.id ? "bg-white text-gray-950 border-white" : "border-gray-700 text-gray-400 hover:text-white"}`}>
            {c.name} ({c._count?.products ?? products.filter((p) => p.serviceCategoryId === c.id).length})
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-400">{loading ? "Loading…" : `${filtered.length} products`}</p>
        <button onClick={startCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-950 text-sm font-black tracking-widest uppercase hover:bg-gray-100 transition-colors">
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product list */}
        <div className="space-y-2">
          {loading && <div className="text-center py-16 text-gray-500 flex items-center justify-center gap-2"><Loader2 size={16} className="animate-spin" /> Loading…</div>}
          {!loading && filtered.length === 0 && (
            <div className="text-center py-16 text-gray-600 border border-dashed border-gray-800">
              <p className="mb-2">No products yet.</p>
              <button onClick={startCreate} className="text-xs text-white underline">Add first product →</button>
            </div>
          )}
          {filtered.map((p) => (
            <div key={p.id}
              className={`flex items-start gap-4 p-4 bg-gray-900 border ${editing?.id === p.id ? "border-white" : "border-gray-800"} hover:border-gray-600 transition-colors`}>
              <div className="relative w-16 h-16 shrink-0 bg-gray-800 overflow-hidden">
                {p.image
                  ? <Image src={p.image} alt={p.name} fill className="object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-gray-600 text-[10px]">No img</div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 flex-wrap">
                  <p className="text-sm font-bold text-white truncate">{p.name}</p>
                  {p.serviceCategory && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-blue-900/60 text-blue-300 shrink-0">{p.serviceCategory.name}</span>
                  )}
                  <span className={`text-[10px] px-1.5 py-0.5 shrink-0 ${p.isActive ? "bg-green-900 text-green-300" : "bg-gray-800 text-gray-500"}`}>
                    {p.isActive ? "Active" : "Hidden"}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{p.category}</p>
                <p className="text-xs text-gray-600 mt-1 line-clamp-1">{p.description}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => toggleActive(p)} className="p-1.5 text-gray-500 hover:text-white transition-colors">
                  {p.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <button onClick={() => startEdit(p)} className="p-1.5 text-gray-500 hover:text-white transition-colors">
                  <Pencil size={14} />
                </button>
                <button onClick={() => handleDeleteProduct(p.id)} disabled={deleting === p.id}
                  className="p-1.5 text-gray-500 hover:text-red-400 transition-colors">
                  {deleting === p.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Product form */}
        {showForm && (
          <div className="bg-gray-900 border border-gray-700 p-6 space-y-5 sticky top-4 self-start max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white">{editing ? "Edit Product" : "New Product"}</h3>
              <button onClick={closeForm} className="text-gray-500 hover:text-white"><X size={16} /></button>
            </div>

            {/* Service Category selector with inline create + edit */}
            <div>
              <label className="text-xs text-gray-400 tracking-widest uppercase block mb-1.5">
                Service Category <span className="text-red-400">*</span>
              </label>
              <div className="flex gap-2">
                <select value={form.serviceCategoryId ?? ""} onChange={(e) => handleCategorySelect(e.target.value)}
                  className={`${ic} flex-1`}>
                  <option value="">— Select category —</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <button type="button" onClick={openInlineCat} title="Create new"
                  className="px-3 py-2 bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white border border-gray-600 flex items-center gap-1 text-xs whitespace-nowrap transition-colors">
                  <FolderPlus size={14} /> New
                </button>
              </div>

              {/* Category edit/delete buttons for selected category */}
              {form.serviceCategoryId && (
                <div className="flex gap-2 mt-2">
                  {(() => {
                    const cat = categories.find((c) => c.id === form.serviceCategoryId);
                    if (!cat) return null;
                    return (
                      <>
                        <button type="button" onClick={() => openEditCat(cat)}
                          className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-white border border-gray-700 px-2 py-1 transition-colors">
                          <Pencil size={10} /> Edit Category
                        </button>
                        <button type="button" onClick={() => handleDeleteCat(cat)} disabled={deletingCat === cat.id}
                          className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-red-400 border border-gray-700 px-2 py-1 transition-colors">
                          {deletingCat === cat.id ? <Loader2 size={10} className="animate-spin" /> : <Trash2 size={10} />}
                          Delete Category
                        </button>
                      </>
                    );
                  })()}
                </div>
              )}

              {/* Inline create category */}
              {showInlineCat && (
                <div className="mt-3 p-4 bg-gray-800 border border-gray-600 space-y-3">
                  <p className="text-xs font-black text-white tracking-widest uppercase">Create Category</p>
                  <div>
                    <label className="text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Name *</label>
                    <input value={inlineCatForm.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        setInlineCatForm((f) => ({
                          ...f, name,
                          slug: name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
                        }));
                      }}
                      placeholder="e.g. Aluminium Windows" className={ic} />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Slug *</label>
                    <input value={inlineCatForm.slug}
                      onChange={(e) => setInlineCatForm((f) => ({
                        ...f, slug: e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
                      }))}
                      placeholder="aluminium-windows" className={ic} />
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={handleSaveInlineCat} disabled={savingInlineCat}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-white text-gray-950 text-xs font-black uppercase tracking-widest hover:bg-gray-100 transition-colors disabled:opacity-50">
                      {savingInlineCat ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                      {savingInlineCat ? "Creating…" : "Create & Select"}
                    </button>
                    <button type="button" onClick={() => setShowInlineCat(false)}
                      className="px-3 py-2 text-xs text-gray-400 hover:text-white border border-gray-700 transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Inline edit category */}
              {showEditCat && editingCat && (
                <div className="mt-3 p-4 bg-gray-800 border border-blue-800 space-y-3">
                  <p className="text-xs font-black text-white tracking-widest uppercase">Edit: {editingCat.name}</p>
                  <div>
                    <label className="text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Name *</label>
                    <input value={catForm.name}
                      onChange={(e) => setCatForm((f) => ({ ...f, name: e.target.value }))}
                      className={ic} />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Description</label>
                    <input value={catForm.description}
                      onChange={(e) => setCatForm((f) => ({ ...f, description: e.target.value }))}
                      className={ic} />
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" checked={catForm.isActive}
                      onChange={(e) => setCatForm((f) => ({ ...f, isActive: e.target.checked }))}
                      className="w-4 h-4 accent-white" />
                    <span className="text-xs text-gray-300">Active</span>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={handleSaveCat} disabled={savingCat}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-white text-gray-950 text-xs font-black uppercase tracking-widest hover:bg-gray-100 transition-colors disabled:opacity-50">
                      {savingCat ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                      {savingCat ? "Saving…" : "Update Category"}
                    </button>
                    <button type="button" onClick={() => setShowEditCat(false)}
                      className="px-3 py-2 text-xs text-gray-400 hover:text-white border border-gray-700 transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Product fields */}
            <FormField label="Product Name" required>
              <input value={form.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setForm((f) => ({
                    ...f, name,
                    slug: f.slug || name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
                  }));
                }}
                placeholder="e.g. Sliding Window Classic" className={ic} />
            </FormField>

            <FormField label="Slug (URL)" required>
              <input value={form.slug}
                onChange={(e) => setForm((f) => ({
                  ...f, slug: e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
                }))}
                placeholder="sliding-window-classic" className={ic} />
              {editing && <p className="text-[10px] text-amber-400 mt-1">⚠️ Changing slug auto-redirects old URL.</p>}
            </FormField>

            <FormField label="Category Label" required>
              <input value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                placeholder="e.g. Sliding Windows" className={ic} />
            </FormField>

            <FormField label="Sub-Category">
              <input value={form.subCategory}
                onChange={(e) => setForm((f) => ({ ...f, subCategory: e.target.value }))}
                placeholder="e.g. UPVC Windows" className={ic} />
            </FormField>

            <FormField label="Image URL">
              <input value={form.image}
                onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                placeholder="https://..." className={ic} />
              {form.image && (
                <div className="mt-2 relative h-20 w-full overflow-hidden bg-gray-800">
                  <Image src={form.image} alt="Preview" fill className="object-cover" />
                </div>
              )}
            </FormField>

            <FormField label="Description">
              <textarea value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3} className={`${ic} resize-none`} />
            </FormField>

            <div className="flex items-center gap-3">
              <input type="checkbox" id="active" checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                className="w-4 h-4 accent-white" />
              <label htmlFor="active" className="text-sm text-gray-300">Active (visible on site)</label>
            </div>

            <button onClick={handleSaveProduct} disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-3 bg-white text-gray-950 text-sm font-black tracking-widest uppercase hover:bg-gray-100 transition-colors disabled:opacity-50">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              {saving ? "Saving…" : editing ? "Update Product" : "Create Product"}
            </button>
          </div>
        )}
      </div>
    </AdminShell>
  );
}

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-gray-400 tracking-widest uppercase block mb-1.5">
        {label}{required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}
