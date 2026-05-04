"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X, Check, Phone } from "lucide-react";

export interface EnquiryProduct {
  name: string;
  category: string;
  image: string;
  specs: string[];
  features: string[];
  description: string;
  context?: "product" | "service";
}

interface EnquiryModalProps {
  product: EnquiryProduct;
  onClose: () => void;
}

function buildWhatsAppMessage(
  product: EnquiryProduct,
  name: string,
  phone: string,
  altPhone: string,
  note: string,
  purpose: string,
  location: string,
  quantity: string,
  budget: string,
  address: string,
  city: string,
  houseNo: string,
  landmark: string,
) {
  const isService = product.context === "service";

  const lines = [
    `*New ${isService ? "Service" : "Product"} Enquiry — SAM Enterprises*`,
    ``,
    `*${isService ? "Service" : "Product"}:* ${product.name}`,
    `*Category:* ${product.category}`,
    product.specs?.length > 0
      ? `*Specifications:* ${product.specs.join(", ")}`
      : "",
    ``,
    `*Customer Details*`,
    `Name: ${name || "Not provided"}`,
    `Phone: ${phone || "Not provided"}`,
    altPhone && `Alt Phone: ${altPhone}`,
    purpose && `Purpose: ${purpose}`,
    location && `Location: ${location}`,
    quantity && `Quantity: ${quantity}`,
    budget && `Budget: ${budget}`,
    ``,
    `*Address Details*`,
    houseNo && `House/Flat No: ${houseNo}`,
    address && `Address: ${address}`,
    landmark && `Landmark: ${landmark}`,
    city && `City/Area: ${city}`,
    ``,
    note && `*Note:* ${note}`,
    ``,
    `_Sent via samenterprises.net_`,
  ].filter(Boolean);

  return encodeURIComponent(lines.join("\n"));
}

export default function EnquiryModal({ product, onClose }: EnquiryModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [altPhone, setAltPhone] = useState("");
  const [note, setNote] = useState("");

  const [purpose, setPurpose] = useState("");
  const [location, setLocation] = useState("");

  const [quantity, setQuantity] = useState("");
  const [budget, setBudget] = useState("");

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [houseNo, setHouseNo] = useState("");
  const [landmark, setLandmark] = useState("");

  const [whatsappNumber, setWhatsappNumber] = useState("919876543210");
  const [sitePhone, setSitePhone] = useState("+91 98765 43210");

  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const isService = product.context === "service";
  const buttonText = isService
    ? "Book a Service Enquiry"
    : "Book a Product Enquiry";

  useEffect(() => {
    fetch("/api/public/settings?keys=whatsapp_number,phone_primary")
      .then((r) => r.json())
      .then((d: Record<string, string>) => {
        if (d.whatsapp_number)
          setWhatsappNumber(d.whatsapp_number.replace(/\D/g, ""));
        if (d.phone_primary) setSitePhone(d.phone_primary);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  async function handleSubmit() {
    if (!name.trim() || !phone.trim() || saving) return;

    setSaving(true);

    try {
      await fetch("/api/cms/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          altPhone,
          productName: product.name,
          purpose,
          location,
          quantity,
          budget,
          address,
          city,
          houseNo,
          landmark,
          message: note || `Enquiry about ${product.name}`,
        }),
      });
    } catch {}

    const msg = buildWhatsAppMessage(
      product,
      name,
      phone,
      altPhone,
      note,
      purpose,
      location,
      quantity,
      budget,
      address,
      city,
      houseNo,
      landmark,
    );

    window.open(`https://wa.me/${whatsappNumber}?text=${msg}`, "_blank");

    setSubmitted(true);
    setSaving(false);
  }

  if (submitted) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60">
        <div className="bg-white p-8 rounded-2xl text-center w-full max-w-sm">
          <Check className="mx-auto text-green-500 mb-4" size={32} />
          <h3 className="font-bold text-lg">Enquiry Sent!</h3>
          <button
            onClick={onClose}
            className="mt-4 bg-black text-white px-6 py-2 rounded-xl"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/60 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      {/* ✅ FIXED HERE */}
      <div
        className="bg-white w-full sm:max-w-lg h-[95vh] sm:h-[85vh] sm:my-10 sm:rounded-2xl flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-start gap-4 p-5 border-b sticky top-0 bg-white z-10">
          {product.image && (
            <div className="relative w-14 h-14 rounded-lg overflow-hidden">
              <Image src={product.image} alt="" fill />
            </div>
          )}
          <div className="flex-1">
            <p className="text-xs text-gray-400 uppercase">
              {product.category}
            </p>
            <h3 className="font-bold text-lg">{product.name}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* FORM */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <input
            placeholder="Full name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
          />
          <input
            placeholder="Phone number *"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="input"
          />
          <input
            placeholder="Alternate phone"
            value={altPhone}
            onChange={(e) => setAltPhone(e.target.value)}
            className="input"
          />

          <input
            placeholder="Purpose"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="input"
          />
          <input
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="input"
          />

          <input
            placeholder="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="input"
          />
          <input
            placeholder="Budget"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="input"
          />

          <input
            placeholder="House / Flat No"
            value={houseNo}
            onChange={(e) => setHouseNo(e.target.value)}
            className="input"
          />

          <textarea
            placeholder="Delivery Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="input"
          />

          <input
            placeholder="Landmark"
            value={landmark}
            onChange={(e) => setLandmark(e.target.value)}
            className="input"
          />

          <input
            placeholder="City / Area"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="input"
          />

          <textarea
            placeholder="Additional notes"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="input"
          />

          <div className="h-10" />
        </div>

        {/* FOOTER */}
        <div className="p-5 border-t bg-white space-y-3">
          <button
            onClick={handleSubmit}
            disabled={!name || !phone || saving}
            className="w-full bg-green-500 text-white py-3 rounded-xl font-bold"
          >
            {saving ? "Opening WhatsApp..." : buttonText}
          </button>

          <a
            href={`tel:${sitePhone.replace(/\s/g, "")}`}
            className="w-full flex items-center justify-center gap-2 py-3 border rounded-xl text-gray-700"
          >
            <Phone size={16} /> Call Us Instead
          </a>
        </div>

        <style jsx>{`
          .input {
            width: 100%;
            border: 1px solid #e5e7eb;
            padding: 12px 14px;
            border-radius: 12px;
            font-size: 14px;
          }
          .input:focus {
            outline: none;
            border-color: #22c55e;
          }
        `}</style>
      </div>
    </div>
  );
}
