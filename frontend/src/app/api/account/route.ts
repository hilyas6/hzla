import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { pool } from "@/lib/db";
import { isRateLimited } from "@/lib/rate-limit";

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isRateLimited(`delete-account:${session.user.id}`, 5, 10 * 60 * 1000)) {
    return Response.json(
      { error: "Too many attempts. Try again later." },
      { status: 429 }
    );
  }

  const { password } = await request.json();
  if (typeof password !== "string") {
    return Response.json({ error: "Password is required." }, { status: 400 });
  }

  const { rows } = await pool.query(
    "SELECT password_hash FROM users WHERE id = $1",
    [session.user.id]
  );
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return Response.json({ error: "Incorrect password." }, { status: 400 });
  }

  await pool.query("DELETE FROM users WHERE id = $1", [session.user.id]);

  return Response.json({ ok: true });
}
