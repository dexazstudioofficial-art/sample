"use client";

import { useEffect, useRef, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import {
  Upload, Copy, Trash2, Loader2,
  Image as ImgIcon, CheckCheck,
} from "lucide-react";
import toast from "react-hot-toast";

interface Media {
  id:        string;
  filename:  string;
  url:       string;
  alt:       string;
  size:      number;
  folder:    string;
  createdAt: string;
}

const FOLDERS = ["general", "products", "services", "about", "logos"];

export default function MediaPage() {
  const [files,     setFiles]     = useState<Media[]>([]);
  const [folder,    setFolder]    = useState("general");
  const [loading,   setLoading]   = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting,  setDeleting]  = useState<string | null>(null);
  const [copied,    setCopied]    = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    try {
      const res  = await fetch(`/api/cms/upload?folder=${folder}`);
      const data = await res.json();
      setFiles(Array.isArray(data) ? data : []);
    } catch {
      setFiles([]);
      toast.error("Failed to load media");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [folder]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", folder);
      const res  = await fetch("/api/cms/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) {
        toast.success("Uploaded successfully");
        await load();
      } else {
        toast.error(data.error || "Upload failed — check Cloudinary settings");
      }
    } catch {
      toast.error("Upload failed — check your internet connection");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleDelete(file: Media) {
    if (!confirm(`Delete "${file.filename}"? This cannot be undone.`)) return;
    setDeleting(file.id);
    try {
      const res = await fetch("/api/cms/media", {
        method:  "DELETE",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ id: file.id }),
      });
      if (res.ok) {
        toast.success("Deleted successfully");
        setFiles((prev) => prev.filter((f) => f.id !== file.id));
      } else {
        const data = await res.json();
        toast.error(data.error || "Delete failed");
      }
    } catch {
      toast.error("Network error — please try again");
    } finally {
      setDeleting(null);
    }
  }

  async function copyUrl(url: string) {
    try {
      // Copy the EXACT Cloudinary URL — no prefix added
      // This URL can be pasted directly into any Image URL field
      await navigator.clipboard.writeText(url);
      setCopied(url);
      toast.success("URL copied — paste directly into Image URL field");
      setTimeout(() => setCopied(null), 3000);
    } catch {
      // Fallback for browsers that block clipboard
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(url);
      toast.success("URL copied!");
      setTimeout(() => setCopied(null), 3000);
    }
  }

  function formatBytes(bytes: number) {
    if (bytes < 1024)         return `${bytes} B`;
    if (bytes < 1048576)      return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  }

  return (
    <AdminShell title="Media Library" subtitle="Upload and manage images for all pages">

      {/* How-to banner */}
      <div className="bg-blue-950/30 border border-blue-800 px-4 py-3 mb-6 rounded text-xs text-blue-300 leading-relaxed">
        <strong className="text-blue-200">How to use images:</strong>{" "}
        Upload an image → Click <strong>Copy URL</strong> → Paste directly into any
        <strong> Image URL</strong> field in Products or Services. No editing needed — it works as-is.
      </div>

      {/* Folder tabs + upload button */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div className="flex gap-0 border border-gray-800 overflow-x-auto">
          {FOLDERS.map((f) => (
            <button key={f} onClick={() => setFolder(f)}
              className={`px-4 py-2 text-xs capitalize border-r border-gray-800 last:border-r-0 transition-colors whitespace-nowrap ${
                folder === f ? "bg-white text-gray-950 font-black" : "text-gray-400 hover:text-white"
              }`}>
              {f}
            </button>
          ))}
        </div>

        <label className={`flex items-center gap-2 px-4 py-2.5 bg-white text-gray-950 text-sm font-black tracking-widest uppercase cursor-pointer hover:bg-gray-100 transition-colors ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}>
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
          {uploading ? "Uploading…" : "Upload Image"}
          <input ref={inputRef} type="file" accept="image/*" className="hidden"
            onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-3 py-16 text-gray-500">
          <Loader2 size={18} className="animate-spin" /> Loading…
        </div>
      )}

      {/* Empty state */}
      {!loading && files.length === 0 && (
        <div className="text-center py-20 border border-dashed border-gray-800 text-gray-600">
          <ImgIcon size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No files in <strong>{folder}</strong>.</p>
          <p className="text-xs mt-1 text-gray-700">Click Upload Image to add files.</p>
        </div>
      )}

      {/* Media grid */}
      {!loading && files.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {files.map((file) => (
            <div key={file.id}
              className="group bg-gray-900 border border-gray-800 hover:border-gray-600 transition-colors overflow-hidden">

              {/* Image preview */}
              <div className="aspect-square bg-gray-800 relative overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={file.url} alt={file.alt || file.filename}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />

                {/* CDN badge */}
                {file.url.startsWith("https://res.cloudinary.com") && (
                  <div className="absolute top-1.5 left-1.5 bg-blue-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-sm">
                    CDN
                  </div>
                )}

                {/* Delete button - shows on hover */}
                <button
                  onClick={() => handleDelete(file)}
                  disabled={deleting === file.id}
                  title="Delete image"
                  className="absolute top-1.5 right-1.5 w-7 h-7 bg-red-600 hover:bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-sm">
                  {deleting === file.id
                    ? <Loader2 size={12} className="animate-spin" />
                    : <Trash2 size={12} />}
                </button>
              </div>

              {/* File info */}
              <div className="p-3">
                <p className="text-xs text-gray-300 truncate" title={file.filename}>
                  {file.filename}
                </p>
                <p className="text-[10px] text-gray-600 mt-0.5">
                  {formatBytes(file.size)}
                </p>

                {/* URL preview — shows actual URL */}
                <p className="text-[9px] text-gray-700 mt-1 truncate"
                  title={`Full URL: ${file.url}`}>
                  {file.url.length > 40 ? `…${file.url.slice(-35)}` : file.url}
                </p>

                {/* Copy URL button */}
                <button
                  onClick={() => copyUrl(file.url)}
                  title={`Copy: ${file.url}`}
                  className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 bg-gray-800 text-xs text-gray-400 hover:text-white hover:bg-gray-700 transition-colors rounded-sm">
                  {copied === file.url
                    ? <><CheckCheck size={12} className="text-green-400" /><span className="text-[10px] text-green-400">Copied!</span></>
                    : <><Copy size={12} /><span className="text-[10px]">Copy URL</span></>}
                </button>

                {/* Delete button below (visible always on mobile) */}
                <button
                  onClick={() => handleDelete(file)}
                  disabled={deleting === file.id}
                  className="mt-1 w-full flex items-center justify-center gap-1.5 py-1.5 bg-gray-800 text-xs text-gray-500 hover:text-red-400 hover:bg-gray-700 transition-colors rounded-sm md:hidden">
                  {deleting === file.id
                    ? <><Loader2 size={12} className="animate-spin" />Deleting…</>
                    : <><Trash2 size={12} />Delete</>}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
