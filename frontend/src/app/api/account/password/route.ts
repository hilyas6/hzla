import bcrypt from "bcryptjs";
import { z } from "zod";
import { auth } from "@/auth";
import { pool } from "@/lib/db";
import { sendPasswordChangedEmail } from "@/lib/email";
import { isRateLimited, clientIp } from "@/lib/rate-limit";
import { parseRequest } from "@/lib/validate";
import { logAudit } from "@/lib/audit-log";

const bodySchema = z.object({
  currentPassword: z.string().min(1, "Invalid request."),
  newPassword: z.string().min(8, "Password must be at least 8 characters."),
});

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isRateLimited(`change-password:${session.user.id}`, 5, 10 * 60 * 1000)) {
    return Response.json(
      { error: "Too many attempts. Try again later." },
      { status: 429 }
    );
  }

  const parsed = await parseRequest(request, bodySchema);
  if ("error" in parsed) return parsed.error;
  const { currentPassword, newPassword } = parsed.data;

  const { rows } = await pool.query(
    "SELECT email, password_hash, notify_security_email FROM users WHERE id = $1",
    [session.user.id]
  );
  const user = rows[0];
  if (!user || !user.password_hash) {
    return Response.json(
      { error: "This account signed in with Google and has no password to change." },
      { status: 400 }
    );
  }
  if (!(await bcrypt.compare(currentPassword, user.password_hash))) {
    return Response.json({ error: "Current password is incorrect." }, { status: 400 });
  }
  if (await bcrypt.compare(newPassword, user.password_hash)) {
    return Response.json(
      { error: "New password must be different from your current password." },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [
    passwordHash,
    session.user.id,
  ]);
  await logAudit({ userId: session.user.id, action: "password_change", ip: clientIp(request) });

  if (user.notify_security_email) {
    try {
      await sendPasswordChangedEmail(user.email);
    } catch {
      // Best-effort — the password change already succeeded.
    }
  }

  return Response.json({ ok: true });
}
