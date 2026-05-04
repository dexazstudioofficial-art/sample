"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { Save, Loader2, Globe } from "lucide-react";
import toast from "react-hot-toast";

import {
  FaInstagram,
  FaFacebook,
  FaLinkedin,
  FaYoutube,
  FaPhone,
  FaEnvelope,
  FaWhatsapp,
} from "react-icons/fa";

const LINK_FIELDS = [
  {
    key: "social_instagram",
    label: "Instagram",
    icon: FaInstagram,
    placeholder: "https://instagram.com/pristinewindows",
  },
  {
    key: "social_facebook",
    label: "Facebook",
    icon: FaFacebook,
    placeholder: "https://facebook.com/pristinewindows",
  },
  {
    key: "social_linkedin",
    label: "LinkedIn",
    icon: FaLinkedin,
    placeholder: "https://linkedin.com/company/pristinewindows",
  },
  {
    key: "social_youtube",
    label: "YouTube",
    icon: FaYoutube,
    placeholder: "https://youtube.com/@pristinewindows",
  },
  {
    key: "phone_primary",
    label: "Primary Phone",
    icon: FaPhone,
    placeholder: "+91 98765 43210",
  },
  {
    key: "phone_office",
    label: "Office Phone",
    icon: FaPhone,
    placeholder: "+91 44 2345 6789",
  },
  {
    key: "whatsapp_number",
    label: "WhatsApp Number",
    icon: FaWhatsapp,
    placeholder: "919876543210 (no + sign)",
  },
  {
    key: "email_info",
    label: "Info Email",
    icon: FaEnvelope,
    placeholder: "info@pristinewindows.in",
  },
  {
    key: "email_sales",
    label: "Sales Email",
    icon: FaEnvelope,
    placeholder: "sales@pristinewindows.in",
  },
];

export default function LinksPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);

    const res = await fetch("/api/cms/settings?group=social");
    const res2 = await fetch("/api/cms/settings?group=contact");

    const [social, contact] = await Promise.all([res.json(), res2.json()]);

    const map: Record<string, string> = {};
    [...social, ...contact].forEach((s: { key: string; value: string }) => {
      map[s.key] = s.value;
    });

    setValues(map);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSave() {
    setSaving(true);

    const patch: Record<string, string> = {};
    LINK_FIELDS.forEach((f) => {
      patch[f.key] = values[f.key] ?? "";
    });

    const res = await fetch("/api/cms/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });

    if (res.ok) toast.success("Links saved");
    else toast.error("Save failed");

    setSaving(false);
  }

  return (
    <AdminShell
      title="Links & Contact"
      subtitle="Update social media, WhatsApp, phone and email links used across the site"
    >
      {loading ? (
        <div className="flex items-center gap-3 py-16 text-gray-500">
          <Loader2 size={18} className="animate-spin" /> Loading…
        </div>
      ) : (
        <div className="max-w-2xl">
          <div className="bg-gray-900 border border-gray-800 divide-y divide-gray-800 mb-8">
            {LINK_FIELDS.map(({ key, label, icon: Icon, placeholder }) => (
              <div key={key} className="flex items-center gap-4 px-5 py-4">
                <Icon className="text-gray-500 text-lg shrink-0" />

                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 tracking-widest uppercase mb-1.5">
                    {label}
                  </p>

                  <input
                    type="text"
                    value={values[key] ?? ""}
                    onChange={(e) =>
                      setValues((v) => ({
                        ...v,
                        [key]: e.target.value,
                      }))
                    }
                    placeholder={placeholder}
                    className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-3 py-2 focus:outline-none focus:border-gray-400 transition-colors placeholder:text-gray-600"
                  />
                </div>

                {values[key]?.startsWith("http") && (
                  <a
                    href={values[key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-white transition-colors shrink-0"
                  >
                    <Globe size={14} />
                  </a>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-white text-gray-950 text-sm font-black tracking-widest uppercase hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {saving ? "Saving…" : "Save Links"}
          </button>
        </div>
      )}
    </AdminShell>
  );
}
