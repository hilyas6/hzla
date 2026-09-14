import type { z } from "zod";

// Parses + validates a JSON request body against a zod schema in one call,
// so routes don't each hand-roll typeof checks and malformed-JSON handling.
export async function parseRequest<T extends z.ZodTypeAny>(
  request: Request,
  schema: T
): Promise<{ data: z.infer<T> } | { error: Response }> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return { error: Response.json({ error: "Invalid JSON." }, { status: 400 }) };
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    return {
      error: Response.json(
        { error: result.error.issues[0]?.message ?? "Invalid request." },
        { status: 400 }
      ),
    };
  }
  return { data: result.data };
}
