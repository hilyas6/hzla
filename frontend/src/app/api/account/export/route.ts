import { auth } from "@/auth";
import { pool } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { rows: profileRows } = await pool.query(
    `SELECT email, name, role, created_at, two_factor_enabled, notify_security_email
     FROM users WHERE id = $1`,
    [session.user.id]
  );
  const { rows: activity } = await pool.query(
    `SELECT action, ip, created_at FROM audit_log
     WHERE user_id = $1 ORDER BY created_at DESC`,
    [session.user.id]
  );

  const data = { profile: profileRows[0] ?? null, activity };

  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": "attachment; filename=hzla-data.json",
    },
  });
}
