import { pool } from "@/lib/db";
import { issueOtp } from "@/lib/otp";
import { isRateLimited, clientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    if (isRateLimited(`forgot-password:${clientIp(request)}`, 5, 10 * 60 * 1000)) {
      return Response.json(
        { error: "Too many attempts. Try again later." },
        { status: 429 }
      );
    }

    const { email } = await request.json();
    if (typeof email !== "string") {
      return Response.json({ error: "Email is required." }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase();
    const { rows } = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [normalizedEmail]
    );
    const user = rows[0];

    // Always respond ok, whether or not the account exists — otherwise this
    // endpoint becomes a way to check which emails are registered.
    if (user) {
      await issueOtp(user.id, normalizedEmail);
    }

    return Response.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json(
      { error: `Server error: ${message}` },
      { status: 500 }
    );
  }
}
