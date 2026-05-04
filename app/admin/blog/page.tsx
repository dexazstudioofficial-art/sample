"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { Plus, Pencil, Trash2, Eye, EyeOff, X, Check, Loader2, Globe, FileText } from "lucide-react";
import toast from "react-hot-toast";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  tags: string[];
  isPublished: boolean;
  publishedAt: string | null;
  sortOrder: number;
  createdAt: string;
}

type BlogForm = Omit<BlogPost, "id" | "publishedAt" | "createdAt">;

const EMPTY: BlogForm = {
  slug: "", title: "", excerpt: "", content: "",
  coverImage: "", author: "", tags: [],
  isPublished: false, sortOrder: 0,
};

const inputCls = "w-full bg-gray-800 border border-gray-700 text-white text-sm px-3 py-2.5 focus:outline-none focus:border-gray-400 transition-colors placeholder:text-gray-600";

export default function BlogAdminPage() {
  const [posts,    setPosts]    = useState<BlogPost[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [editing,  setEditing]  = useState<BlogPost | null>(null);
  const [creating, setCreating] = useState(false);
  const [form,     setForm]     = useState<BlogForm>(EMPTY);
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/cms/blog");
    setPosts(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function startEdit(p: BlogPost) {
    setForm({
      slug: p.slug, title: p.title, excerpt: p.excerpt,
      content: p.content, coverImage: p.coverImage, author: p.author,
      tags: p.tags, isPublished: p.isPublished, sortOrder: p.sortOrder,
    });
    setEditing(p); setCreating(false);
  }

  function startCreate() {
    setForm(EMPTY); setEditing(null); setCreating(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const url    = editing ? `/api/cms/blog/${editing.id}` : "/api/cms/blog";
      const method = editing ? "PATCH" : "POST";
      const res    = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) { toast.error((await res.json()).error || "Save failed"); return; }
      toast.success(editing ? "Post updated" : "Post created");
      setEditing(null); setCreating(false);
      await load();
    } finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this blog post? This cannot be undone.")) return;
    setDeleting(id);
    const res = await fetch(`/api/cms/blog/${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Deleted"); await load(); }
    else          toast.error("Delete failed");
    setDeleting(null);
  }

  async function togglePublished(p: BlogPost) {
    await fetch(`/api/cms/blog/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !p.isPublished }),
    });
    await load();
  }

  const showForm = editing !== null || creating;

  return (
    <AdminShell title="Blog" subtitle="Create and manage blog posts shown on the public blog page">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-400">{posts.length} posts ({posts.filter((p) => p.isPublished).length} published)</p>
        <button onClick={startCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-950 text-sm font-black tracking-widest uppercase hover:bg-gray-100 transition-colors">
          <Plus size={16} /> New Post
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LIST */}
        <div className="space-y-2">
          {loading && <p className="text-gray-500 py-8 text-center">Loading…</p>}
          {!loading && posts.length === 0 && (
            <div className="text-center py-12 text-gray-600 border border-dashed border-gray-800">
              No blog posts yet. Click "New Post" to create your first one.
            </div>
          )}
          {posts.map((p) => (
            <div key={p.id}
              className={`flex items-start gap-4 p-4 bg-gray-900 border ${editing?.id === p.id ? "border-white" : "border-gray-800"} hover:border-gray-600 transition-colors`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {p.isPublished
                    ? <Globe size={12} className="text-green-400 shrink-0" />
                    : <FileText size={12} className="text-gray-500 shrink-0" />}
                  <p className="text-sm font-bold text-white truncate">{p.title}</p>
                  <span className={`text-[10px] px-1.5 py-0.5 shrink-0 ${p.isPublished ? "bg-green-900 text-green-300" : "bg-gray-800 text-gray-500"}`}>
                    {p.isPublished ? "Published" : "Draft"}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">/{p.slug}</p>
                {p.author && <p className="text-xs text-gray-600 mt-0.5">By {p.author}</p>}
                <p className="text-xs text-gray-600 mt-1 truncate">{p.excerpt}</p>
                {p.publishedAt && (
                  <p className="text-[10px] text-gray-700 mt-1">
                    {new Date(p.publishedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => togglePublished(p)} className="p-1.5 text-gray-500 hover:text-white"
                  title={p.isPublished ? "Unpublish" : "Publish"}>
                  {p.isPublished ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <button onClick={() => startEdit(p)} className="p-1.5 text-gray-500 hover:text-white">
                  <Pencil size={14} />
                </button>
                <button onClick={() => handleDelete(p.id)} disabled={deleting === p.id}
                  className="p-1.5 text-gray-500 hover:text-red-400">
                  {deleting === p.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* FORM */}
        {showForm && (
          <div className="bg-gray-900 border border-gray-700 p-6 space-y-5 sticky top-4 self-start max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white">{editing ? "Edit Post" : "New Blog Post"}</h3>
              <button onClick={() => { setEditing(null); setCreating(false); }} className="text-gray-500 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <Field label="Title" required>
              <input value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Why UPVC Windows Are Better Than Aluminium"
                className={inputCls} />
            </Field>

            <Field label="Slug (URL)" required>
              <input value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") }))}
                placeholder="upvc-vs-aluminium" className={inputCls} />
            </Field>

            <Field label="Author">
              <input value={form.author}
                onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
                placeholder="e.g. Rajesh Kumar" className={inputCls} />
            </Field>

            <Field label="Cover Image URL">
              <input value={form.coverImage}
                onChange={(e) => setForm((f) => ({ ...f, coverImage: e.target.value }))}
                placeholder="https://..." className={inputCls} />
            </Field>

            <Field label="Excerpt (short summary)">
              <textarea value={form.excerpt}
                onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                rows={2} className={`${inputCls} resize-none`}
                placeholder="A brief summary shown in the blog listing…" />
            </Field>

            <Field label="Content (Markdown / HTML)">
              <textarea value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                rows={10} className={`${inputCls} resize-y font-mono text-xs`}
                placeholder="Write your full article here…" />
            </Field>

            <TagsField tags={form.tags} onChange={(t) => setForm((f) => ({ ...f, tags: t }))} />

            <div className="flex items-center gap-3">
              <input type="checkbox" id="published" checked={form.isPublished}
                onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))}
                className="w-4 h-4 accent-white" />
              <label htmlFor="published" className="text-sm text-gray-300">Publish (visible on site)</label>
            </div>

            <button onClick={handleSave} disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-3 bg-white text-gray-950 text-sm font-black tracking-widest uppercase hover:bg-gray-100 transition-colors disabled:opacity-50">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              {saving ? "Saving…" : editing ? "Update Post" : "Create Post"}
            </button>
          </div>
        )}
      </div>
    </AdminShell>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-gray-400 tracking-widest uppercase block mb-1.5">
        {label}{required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

function TagsField({ tags, onChange }: { tags: string[]; onChange: (t: string[]) => void }) {
  const [input, setInput] = useState("");
  function add() {
    const v = input.trim();
    if (v && !tags.includes(v)) onChange([...tags, v]);
    setInput("");
  }
  return (
    <div>
      <label className="text-xs text-gray-400 tracking-widest uppercase block mb-1.5">Tags</label>
      <div className="flex gap-2 mb-2">
        <input value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
          placeholder="Type a tag and press Enter"
          className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-3 py-2 focus:outline-none focus:border-gray-400 placeholder:text-gray-600" />
        <button type="button" onClick={add}
          className="px-3 py-2 bg-gray-700 text-white text-xs hover:bg-gray-600">Add</button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <span key={t} className="flex items-center gap-1 bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded">
            {t}
            <button onClick={() => onChange(tags.filter((x) => x !== t))} className="text-gray-500 hover:text-red-400">
              <X size={10} />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
