import { getDb } from "../../utils/db";
import { createHash } from "node:crypto";

export default defineEventHandler(async (event) => {
  const user = event.context.user;
  if (!user || user.role !== "admin") {
    throw createError({ statusCode: 403, statusMessage: "Admin access required" });
  }

  const body = await readBody(event);
  const { username, password, role } = body || {};

  if (!username?.trim() || !password?.trim()) {
    throw createError({ statusCode: 400, statusMessage: "Username and password are required" });
  }

  const db = getDb();
  const existing = db.prepare("SELECT id FROM users WHERE username = ?").get(username.trim());
  if (existing) {
    throw createError({ statusCode: 409, statusMessage: "Username already exists" });
  }

  const hash = createHash("sha256").update(password.trim()).digest("hex");
  const validRole = role === "admin" ? "admin" : "user";

  const result = db.prepare("INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)").run(username.trim(), hash, validRole);
  const newUser = db.prepare("SELECT id, username, role, created_at FROM users WHERE id = ?").get(result.lastInsertRowid);

  return { user: newUser };
});
