import bcrypt from "bcryptjs";
import { z } from "zod";
import { auth } from "@/auth";
import { pool } from "@/lib/db";
import { isRateLimited, clientIp } from "@/lib/rate-limit";
import { parseRequest } from "@/lib/validate";
import { logAudit } from "@/lib/audit-log";

const bodySchema = z.object({ password: z.string().min(1, "Password is required.") });

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isRateLimited(`delete-account:${session.user.id}`, 5, 10 * 60 * 1000)) {
    return Response.json(
      { error: "Too many attempts. Try again later." },
      { status: 429 }
    );
  }

  const parsed = await parseRequest(request, bodySchema);
  if ("error" in parsed) return parsed.error;
  const { password } = parsed.data;

  const { rows } = await pool.query(
    "SELECT password_hash FROM users WHERE id = $1",
    [session.user.id]
  );
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return Response.json({ error: "Incorrect password." }, { status: 400 });
  }

  await logAudit({ userId: session.user.id, action: "account_delete", ip: clientIp(request) });
  await pool.query("DELETE FROM users WHERE id = $1", [session.user.id]);

  return Response.json({ ok: true });
}
