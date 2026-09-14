import crypto from "node:crypto";
import { pool } from "./db";
import { sendOtpEmail, type OtpPurpose } from "./email";

export async function issueOtp(
  userId: string,
  email: string,
  purpose: OtpPurpose = "login"
) {
  const code = crypto.randomInt(100000, 1000000).toString();
  const codeHash = crypto.createHash("sha256").update(code).digest("hex");
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await pool.query(
    "UPDATE users SET otp_code_hash = $1, otp_expires_at = $2 WHERE id = $3",
    [codeHash, expiresAt, userId]
  );
  await sendOtpEmail(email, code, purpose);
}

export function isOtpValid(
  user: { otp_code_hash: string | null; otp_expires_at: string | Date | null },
  code: string
) {
  if (!user.otp_code_hash || !user.otp_expires_at) return false;
  if (new Date(user.otp_expires_at) <= new Date()) return false;
  const codeHash = crypto.createHash("sha256").update(code).digest("hex");
  return codeHash === user.otp_code_hash;
}
