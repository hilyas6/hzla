import bcrypt from "bcryptjs";
import { z } from "zod";
import { pool } from "@/lib/db";
import { issueOtp } from "@/lib/otp";
import { isRateLimited, clientIp } from "@/lib/rate-limit";
import { parseRequest } from "@/lib/validate";

const bodySchema = z.object({
  email: z.string().email("Email and password are required."),
  password: z.string().min(1, "Email and password are required."),
});

export async function POST(request: Request) {
  try {
    if (isRateLimited(`login-init:${clientIp(request)}`, 10, 10 * 60 * 1000)) {
      return Response.json(
        { error: "Too many attempts. Try again later." },
        { status: 429 }
      );
    }

    const parsed = await parseRequest(request, bodySchema);
    if ("error" in parsed) return parsed.error;
    const { email, password } = parsed.data;

    const normalizedEmail = email.toLowerCase();
    const { rows } = await pool.query(
      "SELECT id, password_hash, email_verified, two_factor_enabled, is_suspended FROM users WHERE email = $1",
      [normalizedEmail]
    );
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return Response.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    if (user.is_suspended) {
      return Response.json(
        { error: "This account has been suspended. Contact support if you think this is a mistake." },
        { status: 403 }
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
