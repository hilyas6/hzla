import bcrypt from "bcryptjs";
import { pool } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (typeof email !== "string" || typeof password !== "string") {
      return Response.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }
    if (!email.includes("@") || password.length < 8) {
      return Response.json(
        { error: "Enter a valid email and a password of at least 8 characters." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();
    const { rows: existing } = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [normalizedEmail]
    );
    if (existing.length > 0) {
      return Response.json(
        { error: "An account with that email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO users (email, password_hash) VALUES ($1, $2)",
      [normalizedEmail, passwordHash]
    );

    return Response.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json(
      { error: `Server error: ${message}` },
      { status: 500 }
    );
  }
}
