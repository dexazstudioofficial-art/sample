import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "./db";

const ACCESS_SECRET  = new TextEncoder().encode(process.env.JWT_SECRET!);
const REFRESH_SECRET = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET!);
const ACCESS_EXPIRY  = process.env.JWT_ACCESS_EXPIRY  || "15m";
const REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || "7d";

export interface AdminPayload extends JWTPayload {
  adminId: string;
  email: string;
  role: string;
  sessionId: string;
}

// ─── Token generation ─────────────────────────────────────
export async function createAccessToken(payload: Omit<AdminPayload, "iat" | "exp">) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ACCESS_EXPIRY)
    .sign(ACCESS_SECRET);
}

export async function createRefreshToken(payload: Omit<AdminPayload, "iat" | "exp">) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(REFRESH_EXPIRY)
    .sign(REFRESH_SECRET);
}

// ─── Token verification ───────────────────────────────────
export async function verifyAccessToken(token: string): Promise<AdminPayload | null> {
  try {
    const { payload } = await jwtVerify(token, ACCESS_SECRET);
    return payload as AdminPayload;
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(token: string): Promise<AdminPayload | null> {
  try {
    const { payload } = await jwtVerify(token, REFRESH_SECRET);
    return payload as AdminPayload;
  } catch {
    return null;
  }
}

// ─── Cookie helpers ───────────────────────────────────────
const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export function setAuthCookies(
  res: NextResponse,
  accessToken: string,
  refreshToken: string,
) {
  res.cookies.set("pw_access", accessToken, { ...COOKIE_OPTS, maxAge: 60 * 15 });
  res.cookies.set("pw_refresh", refreshToken, { ...COOKIE_OPTS, maxAge: 60 * 60 * 24 * 7 });
}

export function clearAuthCookies(res: NextResponse) {
  res.cookies.delete("pw_access");
  res.cookies.delete("pw_refresh");
}

export async function getAccessToken(): Promise<string | null> {
  const jar = await cookies();
  return jar.get("pw_access")?.value ?? null;
}

export async function getRefreshToken(): Promise<string | null> {
  const jar = await cookies();
  return jar.get("pw_refresh")?.value ?? null;
}

// ─── Session validation (DB check) ───────────────────────
export async function validateSession(sessionId: string): Promise<boolean> {
  const session = await db.session.findUnique({ where: { id: sessionId } });
  if (!session) return false;
  if (session.expiresAt < new Date()) {
    await db.session.delete({ where: { id: sessionId } });
    return false;
  }
  return true;
}

// ─── Get current admin from request ──────────────────────
export async function getCurrentAdmin(): Promise<AdminPayload | null> {
  const token = await getAccessToken();
  if (!token) return null;
  const payload = await verifyAccessToken(token);
  if (!payload) return null;
  const valid = await validateSession(payload.sessionId);
  if (!valid) return null;
  return payload;
}

// ─── In-memory rate limiter (use Redis in production) ─────
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = parseInt(process.env.RATE_LIMIT_MAX || "5");
const WINDOW_MS    = 15 * 60 * 1000; // 15 minutes

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = loginAttempts.get(ip);

  if (!entry || entry.resetAt < now) {
    loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_ATTEMPTS - 1, resetAt: now + WINDOW_MS };
  }

  if (entry.count >= MAX_ATTEMPTS) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: MAX_ATTEMPTS - entry.count, resetAt: entry.resetAt };
}

export function resetRateLimit(ip: string) {
  loginAttempts.delete(ip);
}

// ─── Audit logging ────────────────────────────────────────
export async function audit(
  adminId: string,
  action: string,
  entity: string,
  entityId?: string,
  details?: Record<string, unknown>,
  ip?: string
) {
  await db.auditLog.create({
    data: {
      adminId,
      action,
      entity,
      entityId,
      details: details ? JSON.stringify(details) : null,
      ipAddress: ip,
    },
  });
}
