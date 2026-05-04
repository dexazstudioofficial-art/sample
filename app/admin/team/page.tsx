"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { Plus, Pencil, Trash2, X, Check, Loader2 } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";

interface Member { id: string; name: string; role: string; bio: string; image: string; isLeader: boolean; sortOrder: number; isActive: boolean; }
const EMPTY = { name: "", role: "", bio: "", image: "", isLeader: false, sortOrder: 0, isActive: true };

export default function TeamPage() {
  const [members,  setMembers]  = useState<Member[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [editing,  setEditing]  = useState<Member | null>(null);
  const [creating, setCreating] = useState(false);
  const [form,     setForm]     = useState(EMPTY);
  const [saving,   setSaving]   = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/cms/team");
    setMembers(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const method = editing ? "PATCH" : "POST";
      const body   = editing ? { id: editing.id, ...form } : form;
      const res    = await fetch("/api/cms/team", {
        method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      if (!res.ok) { toast.error("Save failed"); return; }
      toast.success(editing ? "Updated" : "Created");
      setEditing(null); setCreating(false); await load();
    } finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this team member?")) return;
    await fetch("/api/cms/team", {
      method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }),
    });
    toast.success("Deleted"); await load();
  }

  const showForm = editing !== null || creating;

  return (
    <AdminShell title="Team Members" subtitle="Manage leadership and team members shown on the About page">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-400">{members.length} members</p>
        <button onClick={() => { setForm(EMPTY); setEditing(null); setCreating(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-950 text-sm font-black tracking-widest uppercase hover:bg-gray-100 transition-colors">
          <Plus size={16} /> Add Member
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          {loading && <p className="text-gray-500 text-center py-8">Loading…</p>}
          {members.map((m) => (
            <div key={m.id} className={`flex items-start gap-4 p-4 bg-gray-900 border ${editing?.id === m.id ? "border-white" : "border-gray-800"}`}>
              <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 bg-gray-800">
                {m.image && <Image src={m.image} alt={m.name} fill className="object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-bold text-white">{m.name}</p>
                  {m.isLeader && <span className="text-[10px] px-1.5 py-0.5 bg-purple-900 text-purple-300">Leader</span>}
                  <span className={`text-[10px] px-1.5 py-0.5 ${m.isActive ? "bg-green-900 text-green-300" : "bg-gray-800 text-gray-500"}`}>{m.isActive ? "Active" : "Hidden"}</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{m.role}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => { setForm({ name: m.name, role: m.role, bio: m.bio, image: m.image, isLeader: m.isLeader, sortOrder: m.sortOrder, isActive: m.isActive }); setEditing(m); setCreating(false); }} className="p-1.5 text-gray-500 hover:text-white transition-colors"><Pencil size={14} /></button>
                <button onClick={() => handleDelete(m.id)} className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>

        {showForm && (
          <div className="bg-gray-900 border border-gray-700 p-6 space-y-4 sticky top-4 self-start">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white">{editing ? "Edit Member" : "New Member"}</h3>
              <button onClick={() => { setEditing(null); setCreating(false); }} className="text-gray-500 hover:text-white"><X size={16} /></button>
            </div>
            {(["name","role","image"] as const).map(k => (
              <div key={k}>
                <label className="text-xs text-gray-400 tracking-widest uppercase block mb-1.5">{k}</label>
                <input value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} className={ic} placeholder={k === "image" ? "https://..." : ""} />
              </div>
            ))}
            <div>
              <label className="text-xs text-gray-400 tracking-widest uppercase block mb-1.5">Bio</label>
              <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={3} className={`${ic} resize-none`} />
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                <input type="checkbox" checked={form.isLeader} onChange={e => setForm(f => ({ ...f, isLeader: e.target.checked }))} className="w-4 h-4 accent-white" /> Leader
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4 accent-white" /> Active
              </label>
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
