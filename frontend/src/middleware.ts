import { auth } from "@/auth";
import { NextResponse } from "next/server";

// Self-hosted on Node (not Cloudflare edge), so run middleware on the
// Node.js runtime instead of the Edge Runtime — auth.ts pulls in pg/bcryptjs,
// which aren't Edge-Runtime-compatible.
export const runtime = "nodejs";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const role = req.auth?.user?.role;

  if (pathname.startsWith("/admin")) {
    if (role !== "admin") {
      const url = req.auth
        ? new URL("/dashboard", req.nextUrl.origin)
        : new URL("/login", req.nextUrl.origin);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/dashboard") && !req.auth) {
    return NextResponse.redirect(new URL("/login", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
