import { getDb } from "../../utils/db";

export default defineEventHandler(async (event) => {
  const user = event.context.user;
  if (!user || user.role !== "admin") {
    throw createError({ statusCode: 403, statusMessage: "Admin access required" });
  }

  const db = getDb();
  const users = db.prepare("SELECT id, username, role, created_at FROM users ORDER BY created_at DESC").all();
  return { users };
});
