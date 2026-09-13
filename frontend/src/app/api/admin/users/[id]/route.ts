import { auth } from "@/auth";
import { pool } from "@/lib/db";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { role } = await request.json();

  if (role !== "user" && role !== "admin") {
    return Response.json({ error: "Invalid role" }, { status: 400 });
  }

  await pool.query("UPDATE users SET role = $1 WHERE id = $2", [role, id]);
  return Response.json({ ok: true });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();

  if (session?.user?.id === id) {
    return Response.json(
      { error: "You can't delete your own account." },
      { status: 400 }
    );
  }

  await pool.query("DELETE FROM users WHERE id = $1", [id]);
  return Response.json({ ok: true });
}
