import { getDb } from "../../utils/db";
import { testSmbConnection } from "../../utils/samba";

export default defineEventHandler(async (event) => {
  const user = event.context.user;
  if (!user || user.role !== "admin") {
    throw createError({ statusCode: 403, statusMessage: "Admin access required" });
  }

  const rawId = getRouterParam(event, "id");
  const id = parseInt(rawId || "", 10);
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: "Invalid folder ID" });

  const db = getDb();
  const method = getMethod(event);

  // GET — single folder
  if (method === "GET") {
    const folder = db.prepare("SELECT * FROM library_folders WHERE id = ?").get(id);
    if (!folder) throw createError({ statusCode: 404, statusMessage: "Folder not found" });
    return { folder };
  }

  // PATCH — update folder
  if (method === "PATCH" || method === "PUT") {
    const body = await readBody(event);
    const existing = db.prepare("SELECT * FROM library_folders WHERE id = ?").get(id) as any;
    if (!existing) throw createError({ statusCode: 404, statusMessage: "Folder not found" });

    db.prepare(`
      UPDATE library_folders SET
        path = ?, label = ?, type = ?, smb_host = ?, smb_share = ?,
        smb_username = ?, smb_password = ?, smb_domain = ?,
        active = ?
      WHERE id = ?
    `).run(
      body.path ?? existing.path,
      body.label ?? existing.label,
      body.type ?? existing.type,
      body.smb_host ?? existing.smb_host,
      body.smb_share ?? existing.smb_share,
      body.smb_username ?? existing.smb_username,
      body.smb_password ?? existing.smb_password,
      body.smb_domain ?? existing.smb_domain,
      body.active !== undefined ? body.active : existing.active,
      id,
    );

    const updated = db.prepare("SELECT * FROM library_folders WHERE id = ?").get(id);
    return { folder: updated };
  }

  // DELETE
  if (method === "DELETE") {
    const folder = db.prepare("SELECT * FROM library_folders WHERE id = ?").get(id) as any;
    if (!folder) throw createError({ statusCode: 404, statusMessage: "Folder not found" });
    if (folder.type === "local" && folder.path === "./comics") {
      throw createError({ statusCode: 403, statusMessage: "The default Comics folder cannot be deleted" });
    }
    db.prepare("DELETE FROM library_folders WHERE id = ?").run(id);
    return { ok: true };
  }

  // POST — test connection
  if (method === "POST") {
    const action = getQuery(event).action;
    if (action === "test") {
      const folder = db.prepare("SELECT * FROM library_folders WHERE id = ?").get(id) as any;
      if (!folder) throw createError({ statusCode: 404, statusMessage: "Folder not found" });

      if (folder.type === "smb") {
        const ok = testSmbConnection(
          folder.smb_host, folder.smb_share,
          folder.smb_username, folder.smb_password, folder.smb_domain
        );
        return { success: ok };
      }

      // Local folder: just check if path exists
      const { existsSync } = await import("node:fs");
      return { success: existsSync(folder.path) };
    }
    throw createError({ statusCode: 400, statusMessage: "Unknown action" });
  }

  throw createError({ statusCode: 405, statusMessage: "Method not allowed" });
});
