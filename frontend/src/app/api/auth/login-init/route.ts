import bcrypt from "bcryptjs";
import { pool } from "@/lib/db";
import { issueOtp } from "@/lib/otp";
import { isRateLimited, clientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    if (isRateLimited(`login-init:${clientIp(request)}`, 10, 10 * 60 * 1000)) {
      return Response.json(
        { error: "Too many attempts. Try again later." },
        { status: 429 }
      );
    }

    const { email, password } = await request.json();
    if (typeof email !== "string" || typeof password !== "string") {
      return Response.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();
    const { rows } = await pool.query(
      "SELECT id, password_hash, email_verified, two_factor_enabled FROM users WHERE email = $1",
      [normalizedEmail]
    );
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return Response.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    if (!user.email_verified) {
      await issueOtp(user.id, normalizedEmail, "signup");
      return Response.json({ step: "verify-email" });
    }

    if (user.two_factor_enabled) {
      await issueOtp(user.id, normalizedEmail, "login");
      return Response.json({ step: "otp" });
    }

    return Response.json({ step: "none" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json(
      { error: `Server error: ${message}` },
      { status: 500 }
    );
  }
}
