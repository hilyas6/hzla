import { pool } from "@/lib/db";

export async function createSession(params: {
  userId: string;
  remember: boolean;
  userAgent?: string | null;
  ip?: string | null;
}): Promise<string> {
  const { userId, remember, userAgent = null, ip = null } = params;
  const days = remember ? 30 : 1;
  const { rows } = await pool.query(
    `INSERT INTO sessions (user_id, user_agent, ip, remember, expires_at)
     VALUES ($1, $2, $3, $4, now() + ($5 || ' days')::interval)
     RETURNING id`,
    [userId, userAgent, ip, remember, days]
  );
  return rows[0].id;
}
