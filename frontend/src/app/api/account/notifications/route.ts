import { z } from "zod";
import { auth } from "@/auth";
import { pool } from "@/lib/db";
import { parseRequest } from "@/lib/validate";

const bodySchema = z.object({ enabled: z.boolean() });

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = await parseRequest(request, bodySchema);
  if ("error" in parsed) return parsed.error;
  const { enabled } = parsed.data;

  await pool.query(
    "UPDATE users SET notify_security_email = $1 WHERE id = $2",
    [enabled, session.user.id]
  );

  return Response.json({ ok: true });
}
