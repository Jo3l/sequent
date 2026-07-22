import { getDb } from "../../utils/db";
import { createHash } from "node:crypto";
import { createToken } from "../../utils/jwt";

// First-time setup: create admin user
export default defineEventHandler(async (event) => {
  const db = getDb();
  const existing = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin'").get() as any;
  if (existing.count > 0) {
    throw createError({ statusCode: 400, statusMessage: "Setup already completed" });
  }

  const body = await readBody(event);
  const { username, password } = body || {};

  if (!username?.trim() || !password?.trim()) {
    throw createError({ statusCode: 400, statusMessage: "Username and password are required" });
  }

  const hash = createHash("sha256").update(password.trim()).digest("hex");

  db.prepare("INSERT INTO users (username, password_hash, role) VALUES (?, ?, 'admin')").run(username.trim(), hash);

  const user = db.prepare("SELECT id, username, role FROM users WHERE username = ?").get(username.trim()) as any;
  const token = await createToken({ userId: user.id, username: user.username, role: "admin" });

  // JWT returned in body — frontend stores it in a client-side cookie.
  return { token, user: { id: user.id, username: user.username, role: "admin" } };
});
