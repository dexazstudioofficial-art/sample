"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowRight, CheckCircle, Loader2 } from "lucide-react";

const projectTypes = [
  { value: "",                      label: "Select project type"          },
  { value: "residential-new",       label: "Residential — New Build"      },
  { value: "residential-renovation",label: "Residential — Renovation"     },
  { value: "commercial",            label: "Commercial Project"            },
  { value: "replacement",           label: "Window/Door Replacement"       },
  { value: "other",                 label: "Other"                         },
];

function useInView(ref: React.RefObject<HTMLDivElement | null>) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.25 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);
  return visible;
}

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");

  const [name,        setName]        = useState("");
  const [phone,       setPhone]       = useState("");
  const [email,       setEmail]       = useState("");
  const [projectType, setProjectType] = useState("");
  const [message,     setMessage]     = useState("");

  const ref     = useRef<HTMLDivElement | null>(null);
  const visible = useInView(ref);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/cms/enquiries", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          name:        name.trim(),
          phone:       phone.trim(),
          email:       email.trim() || undefined,
          productName: projectType || undefined,
          message:     message.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to send message. Please try again.");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  const fadeUp = (delay = "0ms") => ({
    opacity:    visible ? 1 : 0,
    transform:  visible ? "translateY(0)" : "translateY(15px)",
    transition: `all 0.7s ease-out ${delay}`,
  });

  const inputCls = "w-full border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors";

  return (
    <div className="px-6 md:px-10 lg:px-16 py-20 bg-white text-black">
      <div ref={ref} className="mb-10 transition-all duration-700" style={fadeUp()}>
        <p className="label-sm mb-4">Send a Message</p>
        <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-10">
          Tell Us About
          <br />
          <span className="italic font-extralight">Your Project</span>
        </h2>
      </div>

      {submitted ? (
        <div className="flex flex-col items-start gap-4 py-12">
          <CheckCircle size={40} className="text-foreground" />
          <h3 className="text-2xl font-black">Message Sent!</h3>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
            Thank you for reaching out. Our team will get back to you within 24 hours.
            {email && " A confirmation has been sent to your email."}
          </p>
          <button onClick={() => { setSubmitted(false); setName(""); setPhone(""); setEmail(""); setProjectType(""); setMessage(""); }}
            className="mt-4 text-xs font-bold tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4">
            Send another message
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div style={fadeUp("0ms")}>
              <label className="text-xs text-muted-foreground tracking-widest uppercase block mb-2">Full Name *</label>
              <input required type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Your name" className={inputCls} />
            </div>
            <div style={fadeUp("100ms")}>
              <label className="text-xs text-muted-foreground tracking-widest uppercase block mb-2">Phone *</label>
              <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 00000 00000" className={inputCls} />
            </div>
          </div>

          <div style={fadeUp("200ms")}>
            <label className="text-xs text-muted-foreground tracking-widest uppercase block mb-2">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com" className={inputCls} />
            <p className="text-[10px] text-muted-foreground mt-1">We'll send a confirmation to this address</p>
          </div>

          <div style={fadeUp("300ms")}>
            <label className="text-xs text-muted-foreground tracking-widest uppercase block mb-2">Project Type</label>
            <select value={projectType} onChange={(e) => setProjectType(e.target.value)}
              className={`${inputCls} appearance-none cursor-pointer`}>
              {projectTypes.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div style={fadeUp("400ms")}>
            <label className="text-xs text-muted-foreground tracking-widest uppercase block mb-2">Message *</label>
            <textarea required rows={6} value={message} onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your project — number of windows/doors, location, timeline…"
              className={`${inputCls} resize-none`} />
          </div>

          {error && (
            <div className="text-sm text-red-500 bg-red-50 border border-red-200 px-4 py-3">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-4 bg-foreground text-background text-sm font-black tracking-widest uppercase hover:bg-foreground/80 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
            {loading ? <><Loader2 size={16} className="animate-spin" /> Sending…</> : <>Send Message <ArrowRight size={16} /></>}
          </button>
        </form>
      )}
    </div>
  );
}
