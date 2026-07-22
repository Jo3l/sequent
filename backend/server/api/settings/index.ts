import { getDb } from "../../utils/db";

export default defineEventHandler(async (event) => {
  const user = event.context.user;
  if (!user || user.role !== "admin") {
    throw createError({ statusCode: 403, statusMessage: "Admin access required" });
  }

  const method = getMethod(event);

  if (method === "GET") {
    const db = getDb();
    const rows = db.prepare("SELECT key, value FROM settings").all() as any[];
    const settings: Record<string, string> = {};
    for (const row of rows) {
      settings[row.key] = row.value;
    }
    return { settings };
  }

  if (method === "PUT" || method === "PATCH") {
    const body = await readBody(event);
    const db = getDb();

    const upsert = db.prepare(`
      INSERT INTO settings (key, value) VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `);

    for (const [key, value] of Object.entries(body)) {
      upsert.run(key, String(value));
    }

    return { ok: true };
  }

  throw createError({ statusCode: 405, statusMessage: "Method not allowed" });
});
