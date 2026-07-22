/**
 * Generate a URL-safe slug from a title and optional issue number.
 */
export function slugify(title: string, issueNumber?: string): string {
  let base = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");

  // Append issue number if available (compact format: series-name-1)
  if (issueNumber) {
    const num = String(parseInt(issueNumber, 10) || issueNumber);
    base = `${base}-${num}`;
  }

  return base || "comic";
}
