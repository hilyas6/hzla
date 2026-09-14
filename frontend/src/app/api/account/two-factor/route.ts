import { z } from "zod";
import { auth } from "@/auth";
import { pool } from "@/lib/db";
import { clientIp } from "@/lib/rate-limit";
import { parseRequest } from "@/lib/validate";
import { logAudit } from "@/lib/audit-log";

const bodySchema = z.object({ enabled: z.boolean() });

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = await parseRequest(request, bodySchema);
  if ("error" in parsed) return parsed.error;
  const { enabled } = parsed.data;

  await pool.query("UPDATE users SET two_factor_enabled = $1 WHERE id = $2", [
    enabled,
    session.user.id,
  ]);
  await logAudit({
    userId: session.user.id,
    action: enabled ? "two_factor_enabled" : "two_factor_disabled",
    ip: clientIp(request),
  });

  return Response.json({ ok: true });
}
