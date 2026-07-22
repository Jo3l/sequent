/**
 * Parse comic filename into structured metadata.
 * Uses the same flexible extraction logic as sequent_old:
 * strip tags, years, issue/volume markers, parentheticals, then extract numbers.
 */
export interface ParsedFilename {
  title: string;
  issueNumber: string;
  issueNumInt: number;
  volume: string;
  year: string;
  extra: string;
  raw: string;
}

// Known rip/distribution tags to strip (case-insensitive)
const TAGS = [
  "Minutemen-Faessla", "Mastodon", "Digital-Empire", "Minutemen-InnerDemons",
  "Minutemen-Midas", "Minutemen-PhD", "Darkness-Empire", "JK-Empire",
  "Zoombie-Empire", "Nahga-Empire", "Zone-Empire", "Oroboros-DCP",
  "RedResin-Minutemen-Novus-HD", "Dr.Vink", "Sticky Oak",
];

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function parseFilename(rawFilename: string): ParsedFilename {
  let name = rawFilename.replace(/\.[^.]+$/, "").trim();
  const raw = name;

  // 1. Remove known distribution tags: (Tag) or [Tag]
  for (const tag of TAGS) {
    const re = new RegExp(`\\s*[\\[\\(]${escapeRegex(tag)}[\\]\\)]`, "gi");
    name = name.replace(re, "");
  }

  // 2. Remove year in parentheses: (2020), (2020-2021)
  const yearMatch = name.match(/\((\d{4})(?:-\d{4})?\)/);
  const year = yearMatch ? yearMatch[1] : "";
  name = name.replace(/\s*\(\d{4}(?:-\d{4})?\)\s*/g, " ");

  // 3. Remove remaining parentheticals: (Digital), (HD), etc.
  name = name.replace(/[\\(][^)]*[\\)]/g, " ");

  // 4. Extract issue number: #001, #1, No.1, Issue #1, Ch. 1
  let issueNumber = "";
  const issueMatch = name.match(/#\s*(\d+[A-Za-z]?)/);
  if (issueMatch) {
    issueNumber = issueMatch[1].replace(/^0+/, "") || "0";
    name = name.replace(issueMatch[0], " ");
  } else {
    const altMatch = name.match(/(?:No|Issue|Iss|Num|Ch|Chapter)\.?\s*#?\s*(\d+[A-Za-z]?)/i);
    if (altMatch) {
      issueNumber = altMatch[1].replace(/^0+/, "") || "0";
      name = name.replace(altMatch[0], " ");
    }
  }

  // 5. Extract volume: v01, v1, Vol. 1, Volume 1
  let volume = "";
  const volMatch = name.match(/\b(?:[Vv](?:ol(?:ume)?)?\.?\s*)(\d+)\b/);
  if (volMatch) {
    volume = volMatch[1].replace(/^0+/, "") || "0";
    name = name.replace(volMatch[0], " ");
  }

  // 6. If no explicit issue number and no volume extracted, try trailing standalone number
  if (!issueNumber && !volume) {
    const parts = name.replace(/[\\(\\)]/g, " ").split(/[\s\-_]+/).filter(Boolean);
    const nums: Array<{ value: number; idx: number }> = [];
    parts.forEach((p, i) => {
      const n = parseInt(p, 10);
      if (!isNaN(n) && n > 0 && n < 1000 && (n < 1900 || n > 2099)) {
        nums.push({ value: n, idx: i });
      }
    });
    if (nums.length > 0) {
      const last = nums[nums.length - 1];
      issueNumber = String(last.value);
      // Remove the matched number part from name
      parts.splice(last.idx, 1);
      name = parts.join(" ");
    }
  }

  // If volume was found but no issue number, volume IS the issue number for manga/tankobon
  if (!issueNumber && volume) {
    issueNumber = volume;
  }

  // 7. Clean up the title: remove extra spaces, dashes, brackets
  name = name.replace(/[\[\]]/g, " ");
  name = name.replace(/\s+/g, " ").trim();
  name = name.replace(/[-–—]\s*$/, "").trim();

  const issueNumInt = parseInt(issueNumber || "0", 10) || 0;

  return {
    title: name || raw,
    issueNumber,
    issueNumInt,
    volume,
    year,
    extra: "",
    raw,
  };
}

/**
 * Normalize a filename for database/comparison lookup.
 */
export function normalizeFilename(raw: string): string {
  return raw
    .replace(/\.[^.]+$/, "")              // remove extension
    .replace(/[_\s]+/g, " ")              // underscores/whitespace → space
    .replace(/[()]/g, "")                 // remove parentheses
    .replace(/\bVol\.?\s*/gi, "v")       // Vol. → v
    .toLowerCase()
    .trim();
}
