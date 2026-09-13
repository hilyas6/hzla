import { pool } from "@/lib/db";
import { isOtpValid } from "@/lib/otp";
import { isRateLimited, clientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    if (isRateLimited(`verify-email:${clientIp(request)}`, 10, 10 * 60 * 1000)) {
      return Response.json(
        { error: "Too many attempts. Try again later." },
        { status: 429 }
      );
    }

    const { email, code } = await request.json();
    if (typeof email !== "string" || typeof code !== "string") {
      return Response.json({ error: "Invalid request." }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase();
    const { rows } = await pool.query(
      "SELECT id, otp_code_hash, otp_expires_at FROM users WHERE email = $1",
      [normalizedEmail]
    );
    const user = rows[0];
    if (!user || !isOtpValid(user, code)) {
      return Response.json({ error: "Invalid or expired code." }, { status: 400 });
    }

    await pool.query(
      `UPDATE users SET email_verified = true, otp_code_hash = NULL,
              otp_expires_at = NULL WHERE id = $1`,
      [user.id]
    );

    return Response.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json(
      { error: `Server error: ${message}` },
      { status: 500 }
    );
  }
}
