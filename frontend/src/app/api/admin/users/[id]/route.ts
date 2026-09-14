import { z } from "zod";
import { auth } from "@/auth";
import { pool } from "@/lib/db";
import { clientIp } from "@/lib/rate-limit";
import { parseRequest } from "@/lib/validate";
import { logAudit } from "@/lib/audit-log";
import { canSetRole, canDeleteUser, type Role } from "@/lib/roles";

const roleSchema = z.object({ role: z.enum(["user", "admin"]) });

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  const actorRole = session?.user?.role as Role | undefined;
  if (!session?.user || !actorRole) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.id === id) {
    return Response.json({ error: "You can't change your own role." }, { status: 400 });
  }

  const parsed = await parseRequest(request, roleSchema);
  if ("error" in parsed) return parsed.error;
  const { role } = parsed.data;

  const { rows } = await pool.query("SELECT role FROM users WHERE id = $1", [id]);
  const target = rows[0];
  if (!target) return Response.json({ error: "User not found." }, { status: 404 });

  if (!canSetRole(actorRole, target.role as Role, role)) {
    return Response.json(
      { error: "You don't have permission to make that change." },
      { status: 403 }
    );
  }

  await pool.query("UPDATE users SET role = $1 WHERE id = $2", [role, id]);
  await logAudit({
    userId: session.user.id,
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
  const actorRole = session?.user?.role as Role | undefined;
  if (!session?.user || !actorRole) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.id === id) {
    return Response.json(
      { error: "You can't delete your own account." },
      { status: 400 }
    );
  }

  const { rows } = await pool.query("SELECT role FROM users WHERE id = $1", [id]);
  const target = rows[0];
  if (!target) return Response.json({ error: "User not found." }, { status: 404 });

  if (!canDeleteUser(actorRole, target.role as Role)) {
    return Response.json(
      { error: "You don't have permission to delete that user." },
      { status: 403 }
    );
  }

  await pool.query("DELETE FROM users WHERE id = $1", [id]);
  await logAudit({
    userId: session.user.id,
    action: "admin_user_delete",
    targetId: id,
    ip: clientIp(request),
  });
  return Response.json({ ok: true });
}
