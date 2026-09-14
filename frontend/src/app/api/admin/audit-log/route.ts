import { pool } from "@/lib/db";

export async function GET() {
  // ponytail: flat LIMIT, no pagination — fine until the log actually grows
  // past a screenful; add cursor-based paging when that happens.
  const { rows } = await pool.query(
    `SELECT a.id, a.action, a.ip, a.metadata, a.created_at,
            u.email AS user_email, t.email AS target_email
     FROM audit_log a
     LEFT JOIN users u ON u.id = a.user_id
     LEFT JOIN users t ON t.id = a.target_id
     ORDER BY a.created_at DESC
     LIMIT 200`
  );
  return Response.json(rows);
}
