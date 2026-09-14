import { pool } from "@/lib/db";

export async function GET() {
  const { rows } = await pool.query(
    "SELECT id, email, role, created_at, is_suspended FROM users ORDER BY created_at DESC"
  );
  return Response.json(rows);
}
