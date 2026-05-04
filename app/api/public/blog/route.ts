import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/public/blog — published posts only, no auth
export async function GET() {
  try {
    const posts = await db.blog.findMany({
      where: { isPublished: true },
      orderBy: [{ sortOrder: "asc" }, { publishedAt: "desc" }],
      select: {
        id: true, slug: true, title: true, excerpt: true,
        coverImage: true, author: true, tags: true,
        publishedAt: true, createdAt: true,
      },
    });
    return NextResponse.json(
      posts.map((p) => ({
        ...p,
        tags: p.tags ? JSON.parse(p.tags) : [],
      })),
    );
  } catch (error) {
    console.error("GET /api/public/blog error:", error);
    return NextResponse.json([]);
  }
}
