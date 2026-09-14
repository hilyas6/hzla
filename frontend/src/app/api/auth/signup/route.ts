import bcrypt from "bcryptjs";
import { z } from "zod";
import { pool } from "@/lib/db";
import { issueOtp } from "@/lib/otp";
import { isRateLimited, clientIp } from "@/lib/rate-limit";
import { parseRequest } from "@/lib/validate";
import { logAudit } from "@/lib/audit-log";

const bodySchema = z.object({
  email: z.string().email("Enter a valid email and a password of at least 8 characters."),
  password: z.string().min(8, "Enter a valid email and a password of at least 8 characters."),
});

export async function POST(request: Request) {
  try {
    if (isRateLimited(`signup:${clientIp(request)}`, 5, 10 * 60 * 1000)) {
      return Response.json(
        { error: "Too many attempts. Try again later." },
        { status: 429 }
      );
    }

    const parsed = await parseRequest(request, bodySchema);
    if ("error" in parsed) return parsed.error;
    const { email, password } = parsed.data;

    const normalizedEmail = email.toLowerCase();
    const { rows: existing } = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [normalizedEmail]
    );
    if (existing.length > 0) {
      return Response.json(
        { error: "An account with that email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id",
      [normalizedEmail, passwordHash]
    );

    await issueOtp(rows[0].id, normalizedEmail, "signup");
    await logAudit({ userId: rows[0].id, action: "signup", ip: clientIp(request) });

    return Response.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json(
      { error: `Server error: ${message}` },
      { status: 500 }
    );
  }
}
