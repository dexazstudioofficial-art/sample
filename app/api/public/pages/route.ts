import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/public/pages?page=home — public, no auth
export async function GET(req: NextRequest) {
  try {
    const page = req.nextUrl.searchParams.get("page");
    if (!page) {
      return NextResponse.json({ error: "page param required" }, { status: 400 });
    }
    const content = await db.pageContent.findMany({
      where: { page },
      orderBy: [{ section: "asc" }, { key: "asc" }],
    });
    return NextResponse.json({ raw: content });
  } catch (error) {
    console.error("GET /api/public/pages error:", error);
    return NextResponse.json({ raw: [] });
  }
}
