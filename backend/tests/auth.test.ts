import { describe, it, expect } from "vitest";
import { createHash } from "node:crypto";

describe("Password hashing", () => {
  it("produces consistent SHA-256 hashes", () => {
    const h1 = createHash("sha256").update("admin123").digest("hex");
    const h2 = createHash("sha256").update("admin123").digest("hex");
    expect(h1).toBe(h2);
    expect(h1.length).toBe(64); // SHA-256 produces 64 hex chars
  });

  it("produces different hashes for different passwords", () => {
    const h1 = createHash("sha256").update("admin123").digest("hex");
    const h2 = createHash("sha256").update("admin456").digest("hex");
    expect(h1).not.toBe(h2);
  });
});
