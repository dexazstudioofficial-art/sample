import { NextRequest, NextResponse } from "next/server";
import { proxy } from "@/app/proxy";

export async function middleware(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;

  // Public enquiry POST — no auth needed
  if (pathname === "/api/cms/enquiries" && req.method === "POST") {
    return NextResponse.next();
  }

  // Admin and CMS routes — proxy handles auth
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/cms")
  ) {
    return proxy(req);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/cms/:path*",
    "/products/:category/:slug",
    "/services/:category/:slug",
  ],
};
