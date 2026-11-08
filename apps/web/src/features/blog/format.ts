/** Date/number helpers for blog UI (Jalali dates with Persian digits). */

const jalali = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Tehran' });

/** "2025-07-03T08:00:00Z" -> "۱۲ تیر ۱۴۰۴" */
export function faDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : jalali.format(d);
}

const LIVE_ORIGIN = /^https?:\/\/(www\.)?banovit\.com(?=\/)/i;

/** Absolute links to our own domain become relative so they stay inside the new site (same paths). */
export function internalHref(href: string): string {
  return href.replace(LIVE_ORIGIN, '');
}

/** Rewrites href="https://banovit.com/..." inside sanitized CMS HTML (images keep their absolute src). */
export function localizeLinks(html: string): string {
  return html.replace(/(<a\b[^>]*?\shref=")https?:\/\/(?:www\.)?banovit\.com(\/[^"]*)"/gi, '$1$2"');
}

export function postPagePath(base: string, page: number): string {
  return page > 1 ? `${base.replace(/\/$/, '')}/page/${page}/` : base;
}
