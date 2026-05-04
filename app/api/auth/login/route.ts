import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  createAccessToken,
  createRefreshToken,
  setAuthCookies,
  checkRateLimit,
  resetRateLimit,
  audit,
} from "@/lib/auth";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

function getIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(req: NextRequest) {
  const ip = getIP(req);

  // ── Rate limiting ─────────────────────────────────────
  const limit = checkRateLimit(ip);
  if (!limit.allowed) {
    const waitMins = Math.ceil((limit.resetAt - Date.now()) / 60000);
    return NextResponse.json(
      { error: `Too many attempts. Try again in ${waitMins} min.` },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((limit.resetAt - Date.now()) / 1000)),
          "X-RateLimit-Remaining": "0",
        },
      },
    );
  }

  // ── Parse & validate body ─────────────────────────────
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid credentials format" },
      { status: 400 },
    );
  }

  const { email, password } = parsed.data;

  // ── Constant-time lookup (prevents timing attacks) ───
  const admin = await db.admin.findUnique({
    where: { email: email.toLowerCase() },
  });

  // Always run bcrypt even if user not found (timing attack mitigation)
  const fakeHash =
    "$2b$12$fakehashforfaketimingattackprevention000000000000000000";
  const passwordMatch = await bcrypt.compare(
    password,
    admin?.passwordHash ?? fakeHash,
  );

  if (!admin || !passwordMatch) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 },
    );
  }

  // ── Create DB session ─────────────────────────────────
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session = await db.session.create({
    data: {
      adminId: admin.id,
      token: crypto.randomUUID(),
      expiresAt,
      ipAddress: ip,
      userAgent: req.headers.get("user-agent") ?? "",
    },
  });

  // ── Update last login ─────────────────────────────────
  await db.admin.update({
    where: { id: admin.id },
    data: { lastLogin: new Date() },
  });

  // ── Generate tokens ───────────────────────────────────
  const tokenPayload = {
    adminId: admin.id,
    email: admin.email,
    role: admin.role,
    sessionId: session.id,
  };

  const [accessToken, refreshToken] = await Promise.all([
    createAccessToken(tokenPayload),
    createRefreshToken(tokenPayload),
  ]);

  // ── Set cookies & clear rate limit ───────────────────
  const res = NextResponse.json({
    ok: true,
    admin: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    },
  });
  setAuthCookies(res, accessToken, refreshToken);
  resetRateLimit(ip);

  // ── Audit log ─────────────────────────────────────────
  await audit(admin.id, "LOGIN", "Admin", admin.id, { ip }, ip);

  return res;
}
