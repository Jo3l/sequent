import { SignJWT, jwtVerify } from "jose";
import { useRuntimeConfig } from "nitropack/runtime";

function getSecret(): Uint8Array {
  const config = useRuntimeConfig();
  return new TextEncoder().encode(config.jwtSecret || "sequent-default-secret");
}

export interface JwtPayload {
  userId: number;
  username: string;
  role: "admin" | "user";
}

export async function createToken(payload: JwtPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}
