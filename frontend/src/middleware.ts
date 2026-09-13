import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { isRateLimited, clientIp } from "@/lib/rate-limit";

// Self-hosted on Node (not Cloudflare edge), so run middleware on the
// Node.js runtime instead of the Edge Runtime — auth.ts pulls in pg/bcryptjs,
// which aren't Edge-Runtime-compatible.
export const runtime = "nodejs";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const role = req.auth?.user?.role;

  // NextAuth's own password-check endpoint — our login-init route gates the
  // UI flow, but this is the one path that actually verifies a password, so
  // it needs its own brute-force throttle independent of that.
  if (pathname.startsWith("/api/auth/callback/credentials")) {
    if (isRateLimited(`login:${clientIp(req)}`, 15, 10 * 60 * 1000)) {
      return NextResponse.json(
        { error: "Too many attempts. Try again later." },
        { status: 429 }
      );
    }
    return NextResponse.next();
  }

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
    "/api/account/:path*",
    "/api/auth/callback/credentials",
  ],
};
