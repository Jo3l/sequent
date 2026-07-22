import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { extname } from "node:path";
import type { ComicMetadata } from "./comicArchive";

const TARGET_WIDTH = 800;

let _sharp: any = null;
async function getSharp(): Promise<any> {
  if (!_sharp) {
    const mod = await import("sharp");
    _sharp = mod.default || mod;
  }
  return _sharp;
}

/**
 * Generate a cover WebP for a comic.
 * Resizes to 800px wide, embeds XMP metadata, writes to coverPath.
 */
export async function generateCover(
  imageBuffer: Buffer,
  metadata: ComicMetadata,
  coverPath: string,
): Promise<boolean> {
  try {
    const s = await getSharp();

    const resized = await s(imageBuffer)
      .resize({ width: TARGET_WIDTH, withoutEnlargement: true })
      .webp({ quality: 85, effort: 4 })
      .toBuffer();

    const xmpXml = buildXmp(metadata);
    const withXmp = embedXMP(resized, xmpXml);

    writeFileSync(coverPath, withXmp);
    return true;
  } catch {
    return false;
  }
}

function buildXmp(meta: ComicMetadata): string {
  const esc = (s: string | undefined): string => {
    if (!s) return "";
    return s
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
  };

  return (
    '<?xpacket begin="\\ufeff" id="W5M0MpCehiHzreSzNTczkc9d"?>\\n' +
    '<x:xmpmeta xmlns:x="adobe:ns:meta/">\\n' +
    '  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">\\n' +
    '    <rdf:Description rdf:about=""\\n' +
    '      xmlns:dc="http://purl.org/dc/elements/1.1/"\\n' +
    '      xmlns:comic="http://ns.sequent.app/comic/"\\n' +
    '      xmlns:xmp="http://ns.adobe.com/xap/1.0/">\\n' +
    `      <dc:title>${esc(meta.title)}</dc:title>\\n` +
    `      <dc:description>${esc(meta.summary)}</dc:description>\\n` +
    (meta.writer ? `      <dc:creator><rdf:Seq><rdf:li>${esc(meta.writer)}</rdf:li></rdf:Seq></dc:creator>\\n` : "") +
    `      <comic:series>${esc(meta.series)}</comic:series>\\n` +
    `      <comic:number>${esc(meta.number)}</comic:number>\\n` +
    `      <comic:volume>${esc(meta.volume)}</comic:volume>\\n` +
    `      <comic:publisher>${esc(meta.publisher)}</comic:publisher>\\n` +
    `      <comic:year>${esc(meta.year)}</comic:year>\\n` +
    "    </rdf:Description>\\n" +
    "  </rdf:RDF>\\n" +
    "</x:xmpmeta>\\n" +
    '<?xpacket end="w"?>'
  );
}

function findXMPOffset(buffer: Buffer): { offset: number; size: number } | null {
  let offset = 12;
  while (offset + 8 <= buffer.length) {
    const fourCC = buffer.toString("ascii", offset, offset + 4);
    const chunkSize = buffer.readUInt32LE(offset + 4);
    if (chunkSize > buffer.length - offset - 8) break;
    if (fourCC === "XMP ") return { offset, size: chunkSize };
    offset += 8 + chunkSize + (chunkSize % 2);
  }
  return null;
}

function embedXMP(webpBuf: Buffer, xmpXml: string): Buffer {
  const xmpBytes = Buffer.from(xmpXml, "utf-8");
  const chunkDataSize = xmpBytes.length;
  const paddedSize = chunkDataSize + (chunkDataSize % 2);

  const xmpChunk = Buffer.alloc(8 + paddedSize);
  xmpChunk.write("XMP ", 0, 4, "ascii");
  xmpChunk.writeUInt32LE(chunkDataSize, 4);
  xmpBytes.copy(xmpChunk, 8);

  const existing = findXMPOffset(webpBuf);
  let result: Buffer;

  if (existing) {
    const paddedOld = existing.size + (existing.size % 2);
    result = Buffer.concat([
      webpBuf.subarray(0, existing.offset),
      xmpChunk,
      webpBuf.subarray(existing.offset + 8 + paddedOld),
    ]);
  } else {
    result = Buffer.concat([webpBuf, xmpChunk]);
  }

  result.writeUInt32LE(result.length - 8, 4);
  return result;
}

export function coverPathFor(comicPath: string): string {
  const ext = extname(comicPath);
  return comicPath.slice(0, -ext.length) + ".webp";
}

// ── Reading metadata back from cover ────────────────────────────────────────

function extractXMP(buffer: Buffer): string | null {
  const xmp = findXMPOffset(buffer);
  if (!xmp) return null;
  return buffer.toString("utf-8", xmp.offset + 8, xmp.offset + 8 + xmp.size);
}

/**
 * Read comic metadata from a cover WebP file's embedded XMP.
 * Returns the parsed metadata, or null if no XMP is found.
 */
export async function readCoverMetadata(coverPath: string): Promise<ComicMetadata | null> {
  try {
    if (!existsSync(coverPath)) return null;
    const buf = readFileSync(coverPath);
    const xmp = extractXMP(buf);
    if (!xmp) return null;

    const { XMLParser } = await import("fast-xml-parser");
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      trimValues: true,
      parseTagValue: false,
    });
    const parsed = parser.parse(xmp);

    const desc =
      parsed?.["x:xmpmeta"]?.["rdf:RDF"]?.["rdf:Description"] ||
      parsed?.xmpmeta?.["rdf:RDF"]?.["rdf:Description"];

    if (!desc || typeof desc !== "object") return null;

    function str(val: unknown): string | undefined {
      if (val === null || val === undefined) return undefined;
      return String(val).trim() || undefined;
    }

    let writer: string | undefined;
    const creator = desc["dc:creator"] || desc["dc"]?.["creator"];
    if (creator) {
      if (typeof creator === "string") {
        writer = creator;
      } else if (creator["rdf:Seq"]?.["rdf:li"]) {
        const li = creator["rdf:Seq"]["rdf:li"];
        writer = Array.isArray(li) ? li[0] : li;
      }
    }

    return {
      title: str(desc["dc:title"] || desc["dc"]?.["title"]),
      series: str(desc["comic:series"] || desc["comic"]?.["series"]),
      number: str(desc["comic:number"] || desc["comic"]?.["number"]),
      volume: str(desc["comic:volume"] || desc["comic"]?.["volume"]),
      summary: str(desc["dc:description"] || desc["dc"]?.["description"]),
      writer,
      publisher: str(desc["comic:publisher"] || desc["comic"]?.["publisher"]),
      year: str(desc["comic:year"] || desc["comic"]?.["year"]),
    };
  } catch {
    return null;
  }
}
