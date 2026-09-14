import { auth } from "@/auth";
import { pool } from "@/lib/db";

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name } = await request.json();
  if (typeof name !== "string" || name.length > 100) {
    return Response.json({ error: "Invalid name." }, { status: 400 });
  }

  await pool.query("UPDATE users SET name = $1 WHERE id = $2", [
    name.trim() || null,
    session.user.id,
  ]);

  return Response.json({ ok: true });
}
