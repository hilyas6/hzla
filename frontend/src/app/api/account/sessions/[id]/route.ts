import { auth } from "@/auth";
import { pool } from "@/lib/db";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await pool.query("DELETE FROM sessions WHERE id = $1 AND user_id = $2", [
    id,
    session.user.id,
  ]);
  return Response.json({ ok: true });
}
