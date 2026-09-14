import { auth } from "@/auth";
import { pool } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { rows } = await pool.query(
    `SELECT action, ip, created_at FROM audit_log
     WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20`,
    [session.user.id]
  );
  return Response.json(rows);
}
