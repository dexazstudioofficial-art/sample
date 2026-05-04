import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { audit } from "@/lib/auth";

const Schema = z.object({
  name:      z.string().min(2),
  role:      z.string(),
  bio:       z.string(),
  image:     z.string().url().or(z.literal("")).default(""),
  isLeader:  z.boolean().default(false),
  sortOrder: z.number().default(0),
  isActive:  z.boolean().default(true),
});

export async function GET() {
  const members = await db.teamMember.findMany({ orderBy: [{ isLeader: "desc" }, { sortOrder: "asc" }] });
  return NextResponse.json(members);
}

export async function POST(req: NextRequest) {
  const adminId = req.headers.get("x-admin-id")!;
  const ip      = req.headers.get("x-forwarded-for") ?? "unknown";
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const m = await db.teamMember.create({ data: parsed.data });
  await audit(adminId, "CREATE", "TeamMember", m.id, { name: m.name }, ip);
  return NextResponse.json(m, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const adminId = req.headers.get("x-admin-id")!;
  const ip      = req.headers.get("x-forwarded-for") ?? "unknown";
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const { id, ...data } = body as { id: string; [k: string]: unknown };
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const m = await db.teamMember.update({ where: { id }, data });
  await audit(adminId, "UPDATE", "TeamMember", id, {}, ip);
  return NextResponse.json({ ok: true, member: m });
}

export async function DELETE(req: NextRequest) {
  const adminId = req.headers.get("x-admin-id")!;
  const ip      = req.headers.get("x-forwarded-for") ?? "unknown";
  const { id }  = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await db.teamMember.delete({ where: { id } });
  await audit(adminId, "DELETE", "TeamMember", id, {}, ip);
  return NextResponse.json({ ok: true });
}
