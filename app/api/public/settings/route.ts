import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Non-sensitive keys safe to expose publicly
const PUBLIC_KEYS = new Set([
  "whatsapp_number", "phone_primary", "phone_office",
  "email_info",      "email_sales",   "site_name",
  "site_tagline",    "address_line1", "address_line2",
  "social_instagram","social_facebook","social_linkedin",
  "social_youtube",  "social_whatsapp",
  "email_from_name", "email_from_address",
]);

// GET /api/public/settings?key=xxx  → single key
// GET /api/public/settings?keys=a,b,c → multiple keys
export async function GET(req: NextRequest) {
  try {
    const key  = req.nextUrl.searchParams.get("key");
    const keys = req.nextUrl.searchParams.get("keys");

    // Multiple keys
    if (keys) {
      const keyList = keys.split(",").map((k) => k.trim()).filter((k) => PUBLIC_KEYS.has(k));
      const settings = await db.siteSettings.findMany({ where: { key: { in: keyList } } });
      const result: Record<string, string> = {};
      settings.forEach((s) => { result[s.key] = s.value; });
      return NextResponse.json(result);
    }

    // Single key
    if (!key) return NextResponse.json({ error: "key required" }, { status: 400 });
    if (!PUBLIC_KEYS.has(key)) {
      return NextResponse.json({ error: "Key not accessible publicly" }, { status: 403 });
    }
    const setting = await db.siteSettings.findUnique({ where: { key } });
    return NextResponse.json({ key, value: setting?.value || "" });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
