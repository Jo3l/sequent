import { getDb } from "../../utils/db";
import { createHash } from "node:crypto";

export default defineEventHandler(async (event) => {
  const currentUser = event.context.user;
  if (!currentUser) {
    throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  }

  const body = await readBody(event);
  const { currentPassword, newPassword } = body || {};

  if (!currentPassword?.trim() || !newPassword?.trim()) {
    throw createError({ statusCode: 400, statusMessage: "Current and new password are required" });
  }

  if (newPassword.trim().length < 6) {
    throw createError({ statusCode: 400, statusMessage: "New password must be at least 6 characters" });
  }

  const db = getDb();

  // Verify current password
  const user = db.prepare("SELECT password_hash FROM users WHERE id = ?").get(currentUser.userId) as any;
  if (!user) {
    throw createError({ statusCode: 404, statusMessage: "User not found" });
  }

  const currentHash = createHash("sha256").update(currentPassword.trim()).digest("hex");
  if (currentHash !== user.password_hash) {
    throw createError({ statusCode: 401, statusMessage: "Current password is incorrect" });
  }

  // Update to new password
  const newHash = createHash("sha256").update(newPassword.trim()).digest("hex");
  db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(newHash, currentUser.userId);

  return { ok: true };
});
