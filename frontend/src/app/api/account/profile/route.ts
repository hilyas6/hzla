import { z } from "zod";
import { auth } from "@/auth";
import { pool } from "@/lib/db";
import { parseRequest } from "@/lib/validate";

const bodySchema = z.object({ name: z.string().max(100, "Invalid name.") });

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = await parseRequest(request, bodySchema);
  if ("error" in parsed) return parsed.error;
  const { name } = parsed.data;

  await pool.query("UPDATE users SET name = $1 WHERE id = $2", [
    name.trim() || null,
    session.user.id,
  ]);

  return Response.json({ ok: true });
}
