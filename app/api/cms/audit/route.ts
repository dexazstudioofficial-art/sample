import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const take   = parseInt(req.nextUrl.searchParams.get("take") ?? "50");
  const entity = req.nextUrl.searchParams.get("entity");

  const logs = await db.auditLog.findMany({
    where:   entity ? { entity } : undefined,
    orderBy: { createdAt: "desc" },
    take,
    include: { admin: { select: { name: true, email: true } } },
  });
  return NextResponse.json(logs);
}
