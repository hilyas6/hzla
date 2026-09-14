import { readFile } from "node:fs/promises";
import path from "node:path";
import { AVATAR_DIR } from "@/lib/avatar-storage";

const VALID_FILENAME = /^[a-f0-9-]+\.jpg$/;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  if (!VALID_FILENAME.test(filename)) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const buffer = await readFile(path.join(AVATAR_DIR, filename));
    return new Response(buffer, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
