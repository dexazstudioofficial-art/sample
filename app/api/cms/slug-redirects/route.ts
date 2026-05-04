import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const redirects = await db.slugRedirect.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(redirects);
  } catch {
    return NextResponse.json({ error: "Failed to fetch redirects" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { oldSlug, newSlug, entity } = await req.json();
    if (!oldSlug || !newSlug) {
      return NextResponse.json({ error: "oldSlug and newSlug required" }, { status: 400 });
    }

    // Upsert — if old slug already has a redirect, update it
    const redirect = await db.slugRedirect.upsert({
      where:  { oldSlug },
      update: { newSlug },
      create: { oldSlug, newSlug, entity: entity || "product" },
    });

    return NextResponse.json(redirect, { status: 201 });
  } catch (err) {
    console.error("POST /api/cms/slug-redirects error:", err);
    return NextResponse.json({ error: "Failed to create redirect" }, { status: 500 });
  }
}
