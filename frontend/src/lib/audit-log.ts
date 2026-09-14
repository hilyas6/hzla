import { pool } from "@/lib/db";

export async function logAudit(params: {
  userId: string | null;
  action: string;
  targetId?: string | null;
  ip?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const { userId, action, targetId = null, ip = null, metadata } = params;
  try {
    await pool.query(
      `INSERT INTO audit_log (user_id, action, target_id, ip, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, action, targetId, ip, metadata ? JSON.stringify(metadata) : null]
    );
  } catch {
    // Best-effort — never let logging failure undo the action it's logging.
  }
}
