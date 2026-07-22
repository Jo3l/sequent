import { getDb } from "../../utils/db";
import { createHash } from "node:crypto";

export default defineEventHandler(async (event) => {
  const currentUser = event.context.user;
  if (!currentUser || currentUser.role !== "admin") {
    throw createError({ statusCode: 403, statusMessage: "Admin access required" });
  }

  const rawId = getRouterParam(event, "id");
  const id = parseInt(rawId || "", 10);
  if (isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid user ID" });
  }

  const db = getDb();
  const method = getMethod(event);

  if (method === "GET") {
    const user = db.prepare("SELECT id, username, role, created_at FROM users WHERE id = ?").get(id);
    if (!user) throw createError({ statusCode: 404, statusMessage: "User not found" });
    return { user };
  }

  if (method === "PATCH" || method === "PUT") {
    const body = await readBody(event);
    const targetUser = db.prepare("SELECT id FROM users WHERE id = ?").get(id) as any;
    if (!targetUser) throw createError({ statusCode: 404, statusMessage: "User not found" });

    // Prevent self-removal of admin
    if (id === currentUser.userId && body.role && body.role !== "admin") {
      throw createError({ statusCode: 400, statusMessage: "Cannot change your own role" });
    }

    if (body.password) {
      const hash = createHash("sha256").update(body.password).digest("hex");
      db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(hash, id);
    }
    if (body.role) {
      db.prepare("UPDATE users SET role = ? WHERE id = ?").run(body.role, id);
    }
    if (body.username) {
      const existing = db.prepare("SELECT id FROM users WHERE username = ? AND id != ?").get(body.username, id);
      if (existing) throw createError({ statusCode: 409, statusMessage: "Username already exists" });
      db.prepare("UPDATE users SET username = ? WHERE id = ?").run(body.username, id);
    }

    const updated = db.prepare("SELECT id, username, role, created_at FROM users WHERE id = ?").get(id);
    return { user: updated };
  }

  if (method === "DELETE") {
    if (id === currentUser.userId) {
      throw createError({ statusCode: 400, statusMessage: "Cannot delete yourself" });
    }
    db.prepare("DELETE FROM users WHERE id = ?").run(id);
    return { ok: true };
  }

  throw createError({ statusCode: 405, statusMessage: "Method not allowed" });
});
