import { z } from "zod";
import { pool } from "@/lib/db";
import { issueOtp } from "@/lib/otp";
import { isRateLimited, clientIp } from "@/lib/rate-limit";
import { parseRequest } from "@/lib/validate";

const bodySchema = z.object({ email: z.string().email("Email is required.") });

export async function POST(request: Request) {
  try {
    if (isRateLimited(`forgot-password:${clientIp(request)}`, 5, 10 * 60 * 1000)) {
      return Response.json(
        { error: "Too many attempts. Try again later." },
        { status: 429 }
      );
    }

    const parsed = await parseRequest(request, bodySchema);
    if ("error" in parsed) return parsed.error;
    const { email } = parsed.data;

    const normalizedEmail = email.toLowerCase();
    const { rows } = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [normalizedEmail]
    );
    const user = rows[0];

    // Always respond ok, whether or not the account exists — otherwise this
    // endpoint becomes a way to check which emails are registered.
    if (user) {
      await issueOtp(user.id, normalizedEmail, "reset");
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
