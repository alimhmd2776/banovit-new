/** Pure helpers for content-page URLs (kept free of server/React imports so they are unit-testable). */

export function decode(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

/** URL segments -> CMS path ("about-us", "landing/b2b"); null for things that can never be a page. */
export function toPagePath(segments: string[]): string | null {
  const parts = segments.map((s) => decode(s).trim().toLowerCase()).filter(Boolean);
  if (parts.length === 0 || parts.length > 4) return null;
  if (parts.some((p) => p.length > 200 || p.startsWith('.') || /[<>"'\\]/.test(p) || /\.[a-z0-9]{2,5}$/.test(p))) return null;
  return parts.join('/');
}
