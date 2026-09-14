import { auth } from "@/auth";
import { pool } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { rows } = await pool.query(
    "SELECT avatar_path FROM users WHERE id = $1",
    [session.user.id]
  );

  return Response.json({ avatarPath: rows[0]?.avatar_path ?? null });
}
