import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentAdmin, clearAuthCookies, audit } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin();

  if (admin) {
    await db.session.deleteMany({ where: { id: admin.sessionId } });
    await audit(admin.adminId, "LOGOUT", "Admin", admin.adminId);
  }

  const res = NextResponse.json({ ok: true });
  clearAuthCookies(res);
  return res;
}
