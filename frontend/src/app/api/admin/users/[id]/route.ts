import { z } from "zod";
import { auth } from "@/auth";
import { pool } from "@/lib/db";
import { clientIp } from "@/lib/rate-limit";
import { parseRequest } from "@/lib/validate";
import { logAudit } from "@/lib/audit-log";

const roleSchema = z.object({ role: z.enum(["user", "admin"]) });

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();

  const parsed = await parseRequest(request, roleSchema);
  if ("error" in parsed) return parsed.error;
  const { role } = parsed.data;

  await pool.query("UPDATE users SET role = $1 WHERE id = $2", [role, id]);
  await logAudit({
    userId: session?.user?.id ?? null,
    action: "admin_role_change",
    targetId: id,
    ip: clientIp(request),
    metadata: { role },
  });
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
  await logAudit({
    userId: session?.user?.id ?? null,
    action: "admin_user_delete",
    targetId: id,
    ip: clientIp(request),
  });
  return Response.json({ ok: true });
}
