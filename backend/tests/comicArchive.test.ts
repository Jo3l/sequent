import { describe, it, expect } from "vitest";
import { getArchiveType, isComicFile } from "../server/utils/comicArchive";

describe("getArchiveType", () => {
  it("detects CBZ", () => {
    expect(getArchiveType("comic.cbz")).toBe("cbz");
  });

  it("detects ZIP as CBZ", () => {
    expect(getArchiveType("comic.zip")).toBe("cbz");
  });

  it("detects CBR", () => {
    expect(getArchiveType("comic.cbr")).toBe("cbr");
  });

  it("detects RAR as CBR", () => {
    expect(getArchiveType("comic.rar")).toBe("cbr");
  });

  it("detects PDF", () => {
    expect(getArchiveType("comic.pdf")).toBe("pdf");
  });

  it("returns unknown for unsupported formats", () => {
    expect(getArchiveType("comic.exe")).toBe("unknown");
    expect(getArchiveType("comic.txt")).toBe("unknown");
  });
});

describe("isComicFile", () => {
  it("recognizes common extensions", () => {
    expect(isComicFile("comic.cbz")).toBe(true);
    expect(isComicFile("comic.cbr")).toBe(true);
    expect(isComicFile("comic.pdf")).toBe(true);
    expect(isComicFile("comic.zip")).toBe(true);
    expect(isComicFile("comic.rar")).toBe(true);
  });

  it("rejects non-comic files", () => {
    expect(isComicFile("readme.txt")).toBe(false);
    expect(isComicFile("image.jpg")).toBe(false);
    expect(isComicFile("comic")).toBe(false);
  });
});
