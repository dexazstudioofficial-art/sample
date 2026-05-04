import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/public/slug-redirect?slug=old-slug
export async function GET(req: NextRequest) {
  try {
    const slug = req.nextUrl.searchParams.get("slug");
    if (!slug) return NextResponse.json(null);

    const redirect = await db.slugRedirect.findUnique({ where: { oldSlug: slug } });
    if (!redirect) return NextResponse.json(null);

    return NextResponse.json({ newSlug: redirect.newSlug, entity: redirect.entity });
  } catch {
    return NextResponse.json(null);
  }
}
