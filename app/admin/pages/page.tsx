"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { Save, Loader2, ChevronDown, ChevronRight, Plus } from "lucide-react";
import toast from "react-hot-toast";

// "services" page tab removed — it is legacy and no longer in the public UI
const PAGE_TABS = ["home", "about", "contact", "blog"];

interface ContentItem {
  page: string;
  section: string;
  key: string;
  value: string;
  type: string;
}

const inputCls =
  "w-full bg-gray-800 border border-gray-700 text-white text-sm px-3 py-2.5 focus:outline-none focus:border-gray-400 transition-colors placeholder:text-gray-600";

export default function PagesAdminPage() {
  const [rawContent, setRawContent] = useState<ContentItem[]>([]);
  const [values,     setValues]     = useState<Record<string, string>>({});
  const [page,       setPage]       = useState("home");
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [collapsed,  setCollapsed]  = useState<Set<string>>(new Set());

  async function load() {
    setLoading(true);
    const res  = await fetch(`/api/cms/pages?page=${page}`);
    const data = await res.json();
    setRawContent(data.raw);
    const map: Record<string, string> = {};
    data.raw.forEach((item: ContentItem) => {
      map[`${item.page}__${item.section}__${item.key}`] = item.value;
    });
    setValues(map);
    setLoading(false);
  }

  useEffect(() => { load(); }, [page]);

  async function handleSave() {
    setSaving(true);
    const pageItems = rawContent.filter((i) => i.page === page);
    const patch = pageItems.map((i) => ({
      page: i.page,
      section: i.section,
      key: i.key,
      value: values[`${i.page}__${i.section}__${i.key}`] ?? i.value,
    }));

    const res = await fetch("/api/cms/pages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });

    if (res.ok) toast.success("Page content saved — changes are live on the site");
    else        toast.error("Save failed");
    setSaving(false);
  }

  // Group by section
  const sections: Record<string, ContentItem[]> = {};
  rawContent
    .filter((i) => i.page === page)
    .forEach((i) => {
      if (!sections[i.section]) sections[i.section] = [];
      sections[i.section].push(i);
    });

  function toggleSection(s: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(s) ? next.delete(s) : next.add(s);
      return next;
    });
  }

  return (
    <AdminShell
      title="Page Content"
      subtitle="Edit text, headings and CTAs for every public page — changes go live instantly"
    >
      {/* Page tabs */}
      <div className="flex gap-0 border-b border-gray-800 mb-8">
        {PAGE_TABS.map((p) => (
          <button key={p} onClick={() => setPage(p)}
            className={`px-5 py-3 text-sm capitalize border-b-2 transition-colors ${
              page === p
                ? "border-white text-white font-medium"
                : "border-transparent text-gray-500 hover:text-gray-300"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center gap-3 py-16 text-gray-500">
          <Loader2 size={18} className="animate-spin" /> Loading…
        </div>
      ) : Object.keys(sections).length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-800 text-gray-600">
          <p>No editable content blocks for this page yet.</p>
          <p className="text-xs mt-2">
            Run the seed script to populate initial content, or add entries via the API.
          </p>
        </div>
      ) : (
        <div className="max-w-3xl space-y-4">
          {Object.entries(sections).map(([section, items]) => {
            const isOpen = !collapsed.has(section);
            return (
              <div key={section} className="bg-gray-900 border border-gray-800">
                <button
                  onClick={() => toggleSection(section)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className="text-xs font-black tracking-widest uppercase text-gray-300">
                    {section}
                  </span>
                  {isOpen
                    ? <ChevronDown size={14} className="text-gray-500" />
                    : <ChevronRight size={14} className="text-gray-500" />}
                </button>

                {isOpen && (
                  <div className="border-t border-gray-800 px-5 py-5 space-y-5">
                    {items.map((item) => {
                      const mapKey = `${item.page}__${item.section}__${item.key}`;
                      const isLong =
                        item.key.includes("body") ||
                        item.key.includes("description") ||
                        item.key.includes("subheading") ||
                        item.key.includes("content");
                      return (
                        <div key={item.key}>
                          <label className="text-xs text-gray-400 tracking-widest uppercase block mb-1.5">
                            {item.key}
                          </label>
                          {isLong ? (
                            <textarea
                              value={values[mapKey] ?? ""}
                              onChange={(e) =>
                                setValues((v) => ({ ...v, [mapKey]: e.target.value }))
                              }
                              rows={4}
                              className={`${inputCls} resize-none`}
                            />
                          ) : (
                            <input
                              type="text"
                              value={values[mapKey] ?? ""}
                              onChange={(e) =>
                                setValues((v) => ({ ...v, [mapKey]: e.target.value }))
                              }
                              className={inputCls}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          <div className="pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-white text-gray-950 text-sm font-black tracking-widest uppercase hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? "Saving…" : "Save Page Content"}
            </button>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
