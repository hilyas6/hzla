import { auth } from "@/auth";
import { NextResponse } from "next/server";

// Self-hosted on Node (not Cloudflare edge), so run middleware on the
// Node.js runtime instead of the Edge Runtime — auth.ts pulls in pg/bcryptjs,
// which aren't Edge-Runtime-compatible.
export const runtime = "nodejs";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const role = req.auth?.user?.role;

  if (pathname.startsWith("/api/admin")) {
    if (role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    if (!req.auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  if (!req.auth) {
    return NextResponse.redirect(new URL("/login", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/tools/fake-job-detector/:path*",
    "/api/detector/:path*",
    "/api/admin/:path*",
  ],
};
