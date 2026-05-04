import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { audit } from "@/lib/auth";

const UpdateSchema = z.object({
  slug:        z.string().min(2).optional(),
  title:       z.string().min(2).optional(),
  excerpt:     z.string().optional(),
  content:     z.string().optional(),
  coverImage:  z.string().url().or(z.literal("")).optional(),
  author:      z.string().optional(),
  tags:        z.array(z.string()).optional(),
  isPublished: z.boolean().optional(),
  sortOrder:   z.number().int().optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const post = await db.blog.findUnique({ where: { id } });
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    return NextResponse.json({ ...post, tags: post.tags ? JSON.parse(post.tags) : [] });
  } catch (error) {
    console.error("GET /api/cms/blog/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const adminId = req.headers.get("x-admin-id");
    const ip      = req.headers.get("x-forwarded-for") ?? "unknown";

    if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let body: unknown;
    try { body = await req.json(); } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = UpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const existing = await db.blog.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    const { tags, isPublished, ...rest } = parsed.data;
    const data: Record<string, unknown> = { ...rest };
    if (tags !== undefined) data.tags = JSON.stringify(tags);
    if (isPublished !== undefined) {
      data.isPublished = isPublished;
      if (isPublished && !existing.publishedAt) data.publishedAt = new Date();
    }

    const post = await db.blog.update({ where: { id }, data });
    await audit(adminId, "UPDATE", "Blog", id, { title: post.title }, ip);
    return NextResponse.json({ ok: true, post: { ...post, tags: post.tags ? JSON.parse(post.tags) : [] } });
  } catch (error) {
    console.error("PATCH /api/cms/blog/[id] error:", error);
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const adminId = req.headers.get("x-admin-id");
    const ip      = req.headers.get("x-forwarded-for") ?? "unknown";

    if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const post = await db.blog.findUnique({ where: { id } });
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    await db.blog.delete({ where: { id } });
    await audit(adminId, "DELETE", "Blog", id, { title: post.title }, ip);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/cms/blog/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
