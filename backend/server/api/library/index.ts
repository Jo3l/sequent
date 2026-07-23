import { getDb } from "../../utils/db";
import { testSmbConnection } from "../../utils/samba";

export default defineEventHandler(async (event) => {
  const user = event.context.user;
  if (!user || user.role !== "admin") {
    throw createError({ statusCode: 403, statusMessage: "Admin access required" });
  }

  const db = getDb();
  const method = getMethod(event);

  // GET — list all library folders
  if (method === "GET") {
    const folders = db.prepare("SELECT * FROM library_folders ORDER BY created_at ASC").all() as any[];
    for (const f of folders) {
      if (f.type === "local" && f.path === "./comics") f.protected = true;
    }
    return { folders };
  }

  // POST — add a library folder
  if (method === "POST") {
    const body = await readBody(event);
    const { path, label, type, smb_host, smb_share, smb_username, smb_password, smb_domain } = body || {};

    if (!path && type === "local") {
      throw createError({ statusCode: 400, statusMessage: "Path is required for local folders" });
    }

    const result = db.prepare(`
      INSERT INTO library_folders (path, label, type, smb_host, smb_share, smb_username, smb_password, smb_domain)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      path || `//${smb_host}/${smb_share}`,
      label || path || smb_share || "",
      type || "local",
      smb_host || "", smb_share || "", smb_username || "", smb_password || "", smb_domain || ""
    );

    const folder = db.prepare("SELECT * FROM library_folders WHERE id = ?").get(result.lastInsertRowid);
    return { folder };
  }

  throw createError({ statusCode: 405, statusMessage: "Method not allowed" });
});
