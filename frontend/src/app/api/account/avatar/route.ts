import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { auth } from "@/auth";
import { pool } from "@/lib/db";
import { isRateLimited } from "@/lib/rate-limit";
import { AVATAR_DIR, avatarFilenameFor } from "@/lib/avatar-storage";
import { parseRequest } from "@/lib/validate";

const DATA_URL_PREFIX = "data:image/jpeg;base64,";
const MAX_BYTES = 2 * 1024 * 1024; // client resizes before upload; this is just a ceiling

const bodySchema = z.object({
  image: z.string().startsWith(DATA_URL_PREFIX, "Invalid image."),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isRateLimited(`avatar-upload:${session.user.id}`, 10, 10 * 60 * 1000)) {
    return Response.json(
      { error: "Too many attempts. Try again later." },
      { status: 429 }
    );
  }

  const parsed = await parseRequest(request, bodySchema);
  if ("error" in parsed) return parsed.error;
  const { image } = parsed.data;

  const buffer = Buffer.from(image.slice(DATA_URL_PREFIX.length), "base64");
  if (buffer.length === 0 || buffer.length > MAX_BYTES) {
    return Response.json({ error: "Image is too large." }, { status: 400 });
  }

  await mkdir(AVATAR_DIR, { recursive: true });
  const filename = avatarFilenameFor(session.user.id);
  await writeFile(path.join(AVATAR_DIR, filename), buffer);

  await pool.query("UPDATE users SET avatar_path = $1 WHERE id = $2", [
    filename,
    session.user.id,
  ]);

  return Response.json({ ok: true, avatarPath: filename });
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await unlink(path.join(AVATAR_DIR, avatarFilenameFor(session.user.id))).catch(() => {});
  await pool.query("UPDATE users SET avatar_path = NULL WHERE id = $1", [
    session.user.id,
  ]);

  return Response.json({ ok: true });
}
