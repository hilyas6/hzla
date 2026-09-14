import path from "node:path";

// Not under public/ — Next's `output: "standalone"` build traces the public
// directory at build time, so files written here at runtime (like uploads)
// aren't reliably served without a server restart. Served instead via
// src/app/api/avatar/[filename]/route.ts, which reads the file per-request.
export const AVATAR_DIR = path.join(process.cwd(), "uploads", "avatars");

export function avatarFilenameFor(userId: string) {
  return `${userId}.jpg`;
}
