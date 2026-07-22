import { getDb } from "../../utils/db";

// Check if any admin exists (used for first-time setup)
export default defineEventHandler(async () => {
  const db = getDb();
  const admin = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin'").get() as any;
  return { needsSetup: admin.count === 0 };
});
