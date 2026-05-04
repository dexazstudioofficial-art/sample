import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { audit } from "@/lib/auth";

const BlogSchema = z.object({
  slug:        z.string().min(2, "Slug must be at least 2 characters"),
  title:       z.string().min(2, "Title must be at least 2 characters"),
  excerpt:     z.string().default(""),
  content:     z.string().default(""),
  coverImage:  z.string().url("Invalid cover image URL").or(z.literal("")).default(""),
  author:      z.string().default(""),
  tags:        z.array(z.string()).default([]),
  isPublished: z.boolean().default(false),
  sortOrder:   z.number().int().default(0),
});

export async function GET() {
  try {
    const posts = await db.blog.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    return NextResponse.json(
      posts.map((p) => ({ ...p, tags: p.tags ? JSON.parse(p.tags) : [] })),
    );
  } catch (error) {
    console.error("GET /api/cms/blog error:", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminId = req.headers.get("x-admin-id");
    const ip      = req.headers.get("x-forwarded-for") ?? "unknown";

    if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let body: unknown;
    try { body = await req.json(); } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = BlogSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const existing = await db.blog.findUnique({ where: { slug: parsed.data.slug } });
    if (existing) return NextResponse.json({ error: "A post with this slug already exists" }, { status: 409 });

    const { tags, isPublished, ...rest } = parsed.data;
    const post = await db.blog.create({
      data: {
        ...rest,
        tags: JSON.stringify(tags),
        isPublished,
        publishedAt: isPublished ? new Date() : null,
      },
    });

    await audit(adminId, "CREATE", "Blog", post.id, { title: post.title }, ip);
    return NextResponse.json({ ...post, tags }, { status: 201 });
  } catch (error) {
    console.error("POST /api/cms/blog error:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
