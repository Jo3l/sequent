import { getDb } from "../utils/db";

export default defineNitroPlugin(() => {
  // Initialize database on startup
  getDb();
  console.log("✅ Database initialized");
});
