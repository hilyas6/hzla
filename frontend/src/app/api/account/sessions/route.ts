import { auth } from "@/auth";
import { pool } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { rows } = await pool.query(
    `SELECT id, user_agent, ip, remember, created_at, last_seen_at, expires_at
     FROM sessions WHERE user_id = $1 ORDER BY last_seen_at DESC`,
    [session.user.id]
  );
  return Response.json(rows);
}

// Log out every device but the one making this request.
export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await pool.query("DELETE FROM sessions WHERE user_id = $1 AND id != $2", [
    session.user.id,
    session.user.sessionId,
  ]);
  return Response.json({ ok: true });
}
