import bcrypt from "bcryptjs";
import { z } from "zod";
import { pool } from "@/lib/db";
import { isOtpValid } from "@/lib/otp";
import { sendPasswordChangedEmail } from "@/lib/email";
import { isRateLimited, clientIp } from "@/lib/rate-limit";
import { parseRequest } from "@/lib/validate";
import { logAudit } from "@/lib/audit-log";

const bodySchema = z.object({
  email: z.string().email("Invalid request."),
  code: z.string().min(1, "Invalid request."),
  newPassword: z.string().min(8, "Password must be at least 8 characters."),
});

export async function POST(request: Request) {
  try {
    if (isRateLimited(`reset-password:${clientIp(request)}`, 10, 10 * 60 * 1000)) {
      return Response.json(
        { error: "Too many attempts. Try again later." },
        { status: 429 }
      );
    }

    const parsed = await parseRequest(request, bodySchema);
    if ("error" in parsed) return parsed.error;
    const { email, code, newPassword } = parsed.data;

    const normalizedEmail = email.toLowerCase();
    const { rows } = await pool.query(
      `SELECT id, password_hash, otp_code_hash, otp_expires_at, notify_security_email
       FROM users WHERE email = $1`,
      [normalizedEmail]
    );
    const user = rows[0];
    if (!user || !isOtpValid(user, code)) {
      return Response.json({ error: "Invalid or expired code." }, { status: 400 });
    }
    if (await bcrypt.compare(newPassword, user.password_hash)) {
      return Response.json(
        { error: "New password must be different from your current password." },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await pool.query(
      `UPDATE users SET password_hash = $1, otp_code_hash = NULL,
              otp_expires_at = NULL WHERE id = $2`,
      [passwordHash, user.id]
    );
    await logAudit({ userId: user.id, action: "password_reset", ip: clientIp(request) });

    if (user.notify_security_email) {
      try {
        await sendPasswordChangedEmail(normalizedEmail);
      } catch {
        // Best-effort — the password reset already succeeded.
      }
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
