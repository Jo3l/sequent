import { verifyToken } from "../utils/jwt";
import type { JwtPayload } from "../utils/jwt";

declare module "h3" {
  interface H3EventContext {
    user?: JwtPayload;
  }
}

const PUBLIC_PREFIXES = ["/api/auth/login", "/api/auth/setup", "/api/auth/logout", "/api/health", "/api/covers/"];

export default defineEventHandler(async (event) => {
  const path = event.path;

  for (const prefix of PUBLIC_PREFIXES) {
    if (path.startsWith(prefix)) return;
  }

  if (!path.startsWith("/api/")) return;

  // Primary: read JWT from cookie (avoids nginx Authorization header conflicts).
  // Fallback: Authorization: Bearer header.
  const cookieToken = getCookie(event, "sequent_token");
  const authHeader = getHeader(event, "Authorization");

  let rawToken = cookieToken ?? null;
  if (!rawToken && authHeader?.startsWith("Bearer ")) {
    rawToken = authHeader.slice(7);
  }

  if (!rawToken) {
    throw createError({ statusCode: 401, statusMessage: "Invalid or expired token" });
  }

  const payload = await verifyToken(rawToken);
  if (!payload) {
    throw createError({ statusCode: 401, statusMessage: "Invalid or expired token" });
  }
  event.context.user = payload;
});
