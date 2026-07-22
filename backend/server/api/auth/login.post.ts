import { getDb } from "../../utils/db";
import { createToken } from "../../utils/jwt";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { username, password } = body || {};

  if (!username?.trim() || !password?.trim()) {
    throw createError({ statusCode: 400, statusMessage: "Username and password are required" });
  }

  const db = getDb();
  const user = db.prepare("SELECT id, username, password_hash, role FROM users WHERE username = ?").get(username.trim()) as any;

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: "Invalid credentials" });
  }

  // Simple password comparison (in production, use bcrypt)
  const { createHash } = await import("node:crypto");
  const hash = createHash("sha256").update(password.trim()).digest("hex");

  if (hash !== user.password_hash) {
    throw createError({ statusCode: 401, statusMessage: "Invalid credentials" });
  }

  const token = await createToken({
    userId: user.id,
    username: user.username,
    role: user.role,
  });

  // JWT is returned in the response body — the frontend stores it in a
  // client-side cookie (via useCookie). We deliberately do NOT set an
  // httpOnly cookie here because the frontend needs to read the cookie
  // value on page reload to decide whether to call /api/auth/me.
  // The client-side cookie is sent automatically on every same-origin
  // request, which avoids conflicts with nginx HTTP Basic auth on a
  // reverse proxy (the Authorization header stays free for nginx).

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
    },
  };
});
