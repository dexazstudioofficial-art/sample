import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const ACCESS_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-change-this",
);

// Routes that never need auth
const PUBLIC_PATHS = [
  "/admin/login",
  "/api/auth/login",
  "/api/auth/refresh",
  "/api/public/",
  "/api/cms/enquiries",  // ← public form submission
];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminRoute  = pathname.startsWith("/admin");
  const isCmsApiRoute = pathname.startsWith("/api/cms");

  if (!isAdminRoute && !isCmsApiRoute) {
    return NextResponse.next();
  }

  // Allow public paths through
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = req.cookies.get("pw_access")?.value;

  if (!token) {
    if (isCmsApiRoute) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  try {
    const { payload } = await jwtVerify(token, ACCESS_SECRET);
    const response = NextResponse.next();
    response.headers.set("x-admin-id",   String(payload.adminId));
    response.headers.set("x-admin-role", String(payload.role));
    response.headers.set("x-session-id", String(payload.sessionId));
    return response;
  } catch {
    if (isCmsApiRoute) {
      return NextResponse.json({ error: "Token expired" }, { status: 401 });
    }
    const res = NextResponse.redirect(new URL("/admin/login", req.url));
    res.cookies.delete("pw_access");
    return res;
  }
}
