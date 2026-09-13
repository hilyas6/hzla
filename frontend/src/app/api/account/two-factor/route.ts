import { auth } from "@/auth";
import { pool } from "@/lib/db";

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { enabled } = await request.json();
  if (typeof enabled !== "boolean") {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  await pool.query("UPDATE users SET two_factor_enabled = $1 WHERE id = $2", [
    enabled,
    session.user.id,
  ]);

  return Response.json({ ok: true });
}
