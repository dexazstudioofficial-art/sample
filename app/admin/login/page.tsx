"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      router.push("/admin/dashboard");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white flex items-center justify-center">
              <span className="text-gray-950 text-xs font-black tracking-wider">
                SE
              </span>
            </div>
            <div>
              <span className="text-sm font-black tracking-widest text-white">
                SAM
              </span>
              <span className="text-sm font-light tracking-widest text-gray-500 ml-1">
                WINDOWS
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-500 tracking-widest uppercase mt-2">
            Admin Panel
          </p>
        </div>

        {/* Card */}
        <div className="bg-gray-900 border border-gray-800 p-8">
          <h1 className="text-xl font-black text-white mb-1">Sign In</h1>
          <p className="text-sm text-gray-500 mb-8">
            Enter your credentials to access the CMS.
          </p>

          {error && (
            <div className="flex items-center gap-3 bg-red-950/50 border border-red-800 text-red-300 px-4 py-3 text-sm mb-6">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="text-xs text-gray-400 tracking-widest uppercase block mb-2">
                Email
              </label>
              <div className="relative">
                <Mail
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@samenterprises.com"
                  className="w-full bg-gray-800 border border-gray-700 text-white placeholder:text-gray-600 text-sm pl-10 pr-4 py-3 focus:outline-none focus:border-white transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs text-gray-400 tracking-widest uppercase block mb-2">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                />
                <input
                  type={showPw ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-800 border border-gray-700 text-white placeholder:text-gray-600 text-sm pl-10 pr-12 py-3 focus:outline-none focus:border-white transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-gray-950 font-black text-sm tracking-widest uppercase py-3.5 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p className="text-xs text-gray-600 text-center mt-8">
            Protected by JWT authentication. All actions are logged.
          </p>
        </div>
      </div>
    </div>
  );
}
