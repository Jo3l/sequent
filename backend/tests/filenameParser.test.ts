import { describe, it, expect } from "vitest";
import { parseFilename, normalizeFilename } from "../server/utils/filenameParser";

describe("parseFilename", () => {
  it("parses 'Series Name #001 (2024)'", () => {
    const result = parseFilename("Batman #001 (2024).cbz");
    expect(result.title).toBe("Batman");
    expect(result.issueNumber).toBe("1");
    expect(result.issueNumInt).toBe(1);
    expect(result.year).toBe("2024");
  });

  it("parses 'Series Name Vol. 3 #12'", () => {
    const result = parseFilename("Saga Vol. 3 #12 (2015).cbr");
    expect(result.title).toBe("Saga");
    expect(result.volume).toBe("3");
    expect(result.issueNumber).toBe("12");
    expect(result.year).toBe("2015");
  });

  it("parses 'Series Name 042'", () => {
    const result = parseFilename("Watchmen 042.cbz");
    expect(result.title).toBe("Watchmen");
    expect(result.issueNumber).toBe("42");
    expect(result.issueNumInt).toBe(42);
  });

  it("parses 'Series Name - Issue 42'", () => {
    const result = parseFilename("Spawn - Issue 42 (1996).cbr");
    expect(result.title).toBe("Spawn");
    expect(result.issueNumber).toBe("42");
    expect(result.year).toBe("1996");
  });

  it("parses 'Series Name Ch. 10'", () => {
    const result = parseFilename("One Piece Ch. 100.zip");
    expect(result.title).toBe("One Piece");
    expect(result.issueNumber).toBe("100");
  });

  it("returns whole name as title when no pattern matches", () => {
    const result = parseFilename("Random Comic File.cbz");
    expect(result.title).toBe("Random Comic File");
    expect(result.issueNumber).toBe("");
    expect(result.issueNumInt).toBe(0);
  });

  it("parses 'Series Name v3 #012 (2023) (Digital)'", () => {
    const result = parseFilename("Invincible v3 #012 (2023) (Digital).cbz");
    expect(result.title).toBe("Invincible");
    expect(result.volume).toBe("3");
    expect(result.issueNumber).toBe("12");
    expect(result.year).toBe("2023");
  });
});

describe("normalizeFilename", () => {
  it("normalizes spacing and case", () => {
    const result = normalizeFilename("Bat-Man_ #001 (2024).cbz");
    expect(result).toContain("bat-man");
    expect(result).toContain("#001");
    expect(result).toContain("2024");
  });

  it("normalizes Vol. prefix", () => {
    const result = normalizeFilename("Saga Vol. 3 #12.cbz");
    expect(result).toContain("saga v3 #12");
  });
});
