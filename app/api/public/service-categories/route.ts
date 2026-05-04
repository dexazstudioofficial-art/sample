import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const cats = await db.serviceCategory.findMany({
      where:   { isActive: true },
      orderBy: { sortOrder: "asc" },
      select:  { id: true, name: true, slug: true, sortOrder: true },
    });
    return NextResponse.json(cats);
  } catch (err) {
    console.error("GET /api/public/service-categories:", err);
    return NextResponse.json([]);
  }
}
