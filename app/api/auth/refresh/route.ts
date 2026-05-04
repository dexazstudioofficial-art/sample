import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  getRefreshToken,
  verifyRefreshToken,
  createAccessToken,
  createRefreshToken,
  setAuthCookies,
  validateSession,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    return NextResponse.json({ error: "No refresh token" }, { status: 401 });
  }

  const payload = await verifyRefreshToken(refreshToken);
  if (!payload) {
    return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
  }

  const valid = await validateSession(payload.sessionId);
  if (!valid) {
    return NextResponse.json({ error: "Session expired" }, { status: 401 });
  }

  const tokenPayload = {
    adminId:   payload.adminId,
    email:     payload.email,
    role:      payload.role,
    sessionId: payload.sessionId,
  };

  const [newAccess, newRefresh] = await Promise.all([
    createAccessToken(tokenPayload),
    createRefreshToken(tokenPayload),
  ]);

  const res = NextResponse.json({ ok: true });
  setAuthCookies(res, newAccess, newRefresh);

  await db.session.update({
    where: { id: payload.sessionId },
    data:  { expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
  });

  return res;
}
