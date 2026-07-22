import { getDb } from "./db";

const COMICVINE_BASE = "https://comicvine.gamespot.com/api";
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36";

export interface CvSearchResult {
  id: string;
  title: string;
  issue_number: number;
  cover: string;
  series: string;
  publisher: string;
  url: string;
}

export interface CvIssueDetail {
  title: string;
  issue_number: number;
  description: string;
  authors: string[];
  cover: string;
  cover_date: string;
  series: string;
  publisher: string;
  url: string;
}

async function getApiKey(): Promise<string> {
  const db = getDb();
  const row = db.prepare("SELECT value FROM settings WHERE key = ?").get("comic_vine_api_key") as any;
  return row?.value || process.env.COMIC_VINE_API_KEY || "";
}

/**
 * Search Comic Vine for issues matching a query.
 */
export async function searchComicVine(query: string): Promise<CvSearchResult[]> {
  const apiKey = await getApiKey();
  if (!apiKey) return [];

  try {
    const url = `${COMICVINE_BASE}/search/?api_key=${apiKey}&format=json&query=${encodeURIComponent(query)}&resources=issue&limit=20`;
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });

    if (!res.ok) return [];

    const data = await res.json();
    if (data.status_code !== 1 || !Array.isArray(data.results)) return [];

    return data.results.map((r: any) => ({
      id: String(r.id),
      title: r.name || `Issue #${r.issue_number}`,
      issue_number: r.issue_number ? Number(r.issue_number) : 0,
      cover: r.image?.medium_url || r.image?.small_url || "",
      series: r.volume?.name || "",
      publisher: r.publisher?.name || "",
      url: r.site_detail_url || "",
    }));
  } catch {
    return [];
  }
}

/**
 * Get detailed info for a specific Comic Vine issue.
 */
export async function getComicVineIssue(issueId: string): Promise<CvIssueDetail | null> {
  const apiKey = await getApiKey();
  if (!apiKey) return null;

  try {
    const cleanId = issueId.replace(/^4000-/, "");
    const url = `${COMICVINE_BASE}/issue/4000-${cleanId}/?api_key=${apiKey}&format=json`;
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });

    if (!res.ok) return null;

    const data = await res.json();
    if (data.status_code === 101 || !data.results) return null;

    const issue = data.results;
    const authors = (issue.person_credits || [])
      .filter((p: any) => p.name)
      .map((p: any) => p.name);

    return {
      title: issue.name || `Issue #${issue.issue_number}`,
      issue_number: issue.issue_number ? Number(issue.issue_number) : 0,
      description: issue.description || "",
      authors,
      cover: issue.image?.super_url || issue.image?.medium_url || "",
      cover_date: issue.cover_date || "",
      series: issue.volume?.name || "",
      publisher: issue.publisher?.name || "",
      url: issue.site_detail_url || "",
    };
  } catch {
    return null;
  }
}
