import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { pool } from "@/lib/db";
import { sendOtpEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (typeof email !== "string" || typeof password !== "string") {
      return Response.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();
    const { rows } = await pool.query(
      "SELECT id, password_hash FROM users WHERE email = $1",
      [normalizedEmail]
    );
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return Response.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const code = crypto.randomInt(100000, 1000000).toString();
    const codeHash = crypto.createHash("sha256").update(code).digest("hex");
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await pool.query(
      "UPDATE users SET otp_code_hash = $1, otp_expires_at = $2 WHERE id = $3",
      [codeHash, expiresAt, user.id]
    );

    await sendOtpEmail(normalizedEmail, code);

    return Response.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json(
      { error: `Server error: ${message}` },
      { status: 500 }
    );
  }
}
