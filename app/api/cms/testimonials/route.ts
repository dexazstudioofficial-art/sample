import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { audit } from "@/lib/auth";

const Schema = z.object({
  name:      z.string().min(2),
  location:  z.string(),
  project:   z.string(),
  quote:     z.string().min(10),
  avatar:    z.string().url().or(z.literal("")).default(""),
  rating:    z.number().min(1).max(5).default(5),
  isActive:  z.boolean().default(true),
  sortOrder: z.number().default(0),
});

export async function GET() {
  const testimonials = await db.testimonial.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json(testimonials);
}

export async function POST(req: NextRequest) {
  const adminId = req.headers.get("x-admin-id")!;
  const ip      = req.headers.get("x-forwarded-for") ?? "unknown";
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const t = await db.testimonial.create({ data: parsed.data });
  await audit(adminId, "CREATE", "Testimonial", t.id, { name: t.name }, ip);
  return NextResponse.json(t, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const adminId = req.headers.get("x-admin-id")!;
  const ip      = req.headers.get("x-forwarded-for") ?? "unknown";
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const { id, ...data } = body as { id: string; [k: string]: unknown };
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const t = await db.testimonial.update({ where: { id }, data });
  await audit(adminId, "UPDATE", "Testimonial", id, {}, ip);
  return NextResponse.json({ ok: true, testimonial: t });
}

export async function DELETE(req: NextRequest) {
  const adminId = req.headers.get("x-admin-id")!;
  const ip      = req.headers.get("x-forwarded-for") ?? "unknown";
  const { id }  = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await db.testimonial.delete({ where: { id } });
  await audit(adminId, "DELETE", "Testimonial", id, {}, ip);
  return NextResponse.json({ ok: true });
}
