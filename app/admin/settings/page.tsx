"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { Save, Loader2, Globe, Phone, Share2, Search, Mail } from "lucide-react";
import toast from "react-hot-toast";

type Setting = { key: string; value: string; label: string; type: string; group: string };

const TABS = [
  { id: "general", label: "General",     icon: Globe   },
  { id: "contact", label: "Contact",     icon: Phone   },
  { id: "social",  label: "Social",      icon: Share2  },
  { id: "email",   label: "Email",       icon: Mail    },
  { id: "seo",     label: "SEO",         icon: Search  },
];

const ic = "w-full border border-gray-700 bg-gray-800 text-white text-sm px-3 py-2.5 focus:outline-none focus:border-gray-400 transition-colors placeholder:text-gray-600";

export default function SettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [values,   setValues]   = useState<Record<string, string>>({});
  const [tab,      setTab]      = useState("general");
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);

  async function load() {
    setLoading(true);
    const res  = await fetch("/api/cms/settings");
    const data: Setting[] = await res.json();
    setSettings(data);
    const map: Record<string, string> = {};
    data.forEach((s) => { map[s.key] = s.value; });
    setValues(map);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleSave() {
    setSaving(true);
    const tabSettings = settings.filter((s) => s.group === tab);
    const patch: Record<string, string> = {};
    tabSettings.forEach((s) => { patch[s.key] = values[s.key] ?? ""; });
    const res = await fetch("/api/cms/settings", {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(patch),
    });
    if (res.ok) toast.success("Settings saved successfully");
    else        toast.error("Save failed");
    setSaving(false);
  }

  const tabSettings = settings.filter((s) => s.group === tab);

  return (
    <AdminShell title="Settings" subtitle="Manage site-wide configuration and email settings">
      <div className="flex gap-0 border-b border-gray-800 mb-8 flex-wrap">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-5 py-3 text-sm border-b-2 transition-colors ${
              tab === id ? "border-white text-white font-medium" : "border-transparent text-gray-500 hover:text-gray-300"
            }`}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center gap-3 py-16 text-gray-500">
          <Loader2 size={18} className="animate-spin" /> Loading…
        </div>
      ) : (
        <div className="max-w-2xl space-y-5">
          {tab === "email" && (
            <div className="bg-blue-950/30 border border-blue-800 p-4 mb-6">
              <p className="text-xs text-blue-300 font-bold uppercase tracking-widest mb-1">Email Configuration Info</p>
              <p className="text-xs text-blue-400 leading-relaxed">
                SMTP credentials (host, port, username, password) are stored securely in the server <code className="bg-blue-900/50 px-1">.env</code> file
                and are managed by your developer. Here you can configure where emails are <strong>sent from</strong> (display name/address)
                and <strong>delivered to</strong> (admin notification email).
              </p>
            </div>
          )}

          {tabSettings.map((s) => (
            <div key={s.key}>
              <label className="text-xs text-gray-400 tracking-widest uppercase block mb-1.5">
                {s.label}
              </label>
              {s.type === "password" ? (
                <input type="password" value={values[s.key] ?? ""} placeholder="••••••••"
                  onChange={(e) => setValues((v) => ({ ...v, [s.key]: e.target.value }))}
                  className={ic} />
              ) : (
                <input type={s.type === "url" ? "url" : "text"}
                  value={values[s.key] ?? ""}
                  onChange={(e) => setValues((v) => ({ ...v, [s.key]: e.target.value }))}
                  className={ic} />
              )}
            </div>
          ))}

          {tabSettings.length === 0 && (
            <p className="text-sm text-gray-600 py-8 text-center">No settings in this group yet.</p>
          )}

          <div className="pt-4">
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-white text-gray-950 text-sm font-black tracking-widest uppercase hover:bg-gray-100 transition-colors disabled:opacity-50">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? "Saving…" : "Save Settings"}
            </button>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
