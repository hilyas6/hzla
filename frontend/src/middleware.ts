import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { isRateLimited, clientIp } from "@/lib/rate-limit";
import { pool } from "@/lib/db";

// Self-hosted on Node (not Cloudflare edge), so run middleware on the
// Node.js runtime instead of the Edge Runtime — auth.ts pulls in pg/bcryptjs,
// which aren't Edge-Runtime-compatible.
export const runtime = "nodejs";

export default auth(async (req) => {
  const { pathname } = req.nextUrl;
  const role = req.auth?.user?.role;
  const userId = req.auth?.user?.id;
  const sessionId = req.auth?.user?.sessionId;

  // The JWT itself has no server-side revocation, so a ban or a revoked
  // device/"log out everywhere" wouldn't take effect until the token expires
  // (up to 30 days) unless we check our own sessions table on every
  // authenticated request here — the one place all protected routes funnel
  // through. Also refreshes last_seen_at for the device-management UI.
  if (userId && sessionId) {
    const { rows } = await pool.query(
      `UPDATE sessions s SET last_seen_at = now()
       FROM users u
       WHERE s.id = $1 AND s.user_id = $2 AND s.user_id = u.id AND s.expires_at > now()
       RETURNING u.is_suspended`,
      [sessionId, userId]
    );
    const valid = rows[0];
    if (!valid || valid.is_suspended) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "Your session has ended. Please log in again." },
          { status: 401 }
        );
      }
      return NextResponse.redirect(new URL("/login", req.nextUrl.origin));
    }
  }

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
    if (role !== "admin" && role !== "owner") {
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
