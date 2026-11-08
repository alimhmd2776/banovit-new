import { NextResponse, type NextRequest } from 'next/server';

/**
 * Old-URL redirects (docs/07-feature-parity.md G13): the CMS «ریدایرکت‌ها»
 * manager (Yoast redirects of the old site, admin rows, category path
 * changes) plus old product/blog slugs (WP _wp_old_slug).
 *
 * The whole set comes from GET {STOREFRONT_API_URL}/redirects and lives in
 * memory; it is refreshed in the background every minute (only the version is
 * transferred when nothing changed). A CMS outage keeps the last set; with no
 * set at all the request simply continues.
 */

type Rule = { to: string | null; status: number };
type RegexRule = Rule & { re: RegExp };
type Doc = { version: string; exact: Record<string, Rule>; regex: RegexRule[] };

const TTL_MS = 60_000;
const FETCH_TIMEOUT_MS = 2_000;

let doc: Doc | null = null;
let fetchedAt = 0;
let inflight: Promise<void> | null = null;

function apiUrl(): string {
  return (process.env.STOREFRONT_API_URL ?? 'http://127.0.0.1:8000/api/storefront/v1').replace(/\/$/, '');
}

async function refresh(): Promise<void> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const qs = doc ? `?since=${encodeURIComponent(doc.version)}` : '';
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (process.env.STOREFRONT_INTERNAL_TOKEN) headers['X-Storefront-Token'] = process.env.STOREFRONT_INTERNAL_TOKEN;
    const res = await fetch(`${apiUrl()}/redirects${qs}`, { headers, signal: ctrl.signal, cache: 'no-store' });
    if (!res.ok) return;
    const body = (await res.json()) as {
      data: { version: string; unchanged?: boolean; exact?: Record<string, Rule>; regex?: { pattern: string; to: string | null; status: number }[] };
    };
    if (body.data.unchanged && doc) return;
    const regex: RegexRule[] = [];
    for (const r of body.data.regex ?? []) {
      try {
        regex.push({ re: new RegExp(r.pattern, 'i'), to: r.to, status: r.status });
      } catch {
        // a pattern JS cannot compile is skipped (the panel validates with PHP)
      }
    }
    doc = { version: body.data.version, exact: body.data.exact ?? {}, regex };
  } catch {
    // keep the previous set
  } finally {
    clearTimeout(timer);
    fetchedAt = Date.now();
  }
}

async function current(): Promise<Doc | null> {
  if (Date.now() - fetchedAt > TTL_MS && !inflight) {
    inflight = refresh().finally(() => {
      inflight = null;
    });
  }
  // Only the very first request waits; later ones use the set in memory.
  if (!doc && inflight) await inflight;
  return doc;
}

/** Same as the CMS RedirectMap::normalize(): decoded, lower-case, "/a/b/". */
function normalize(pathname: string): string {
  let p = pathname;
  try {
    p = decodeURIComponent(pathname);
  } catch {
    // malformed escapes: match as given
  }
  const trimmed = p.replace(/\/{2,}/g, '/').toLowerCase().replace(/^\/+|\/+$/g, '');
  return trimmed === '' ? '/' : `/${trimmed}/`;
}

function match(d: Doc, path: string): Rule | null {
  const exact = d.exact[path];
  if (exact) return exact;
  if (d.regex.length === 0) return null;
  const subject = path.replace(/^\//, '');
  for (const r of d.regex) {
    const m = r.re.exec(subject) ?? r.re.exec(subject.replace(/\/$/, ''));
    if (m) {
      return { status: r.status, to: r.to === null ? null : r.to.replace(/\$(\d+)/g, (_, i: string) => m[Number(i)] ?? '') };
    }
  }
  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (pathname === '/') return NextResponse.next();

  const d = await current();
  if (!d) return NextResponse.next();

  const rule = match(d, normalize(pathname));
  if (!rule) return NextResponse.next();

  if (rule.status === 410 || rule.status === 451 || rule.to === null) {
    return new NextResponse('این صفحه حذف شده است.', {
      status: rule.status === 451 ? 451 : 410,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=300' },
    });
  }

  // Like Yoast: the visitor's query string travels along unless the target has its own.
  let location = rule.to;
  if (search && !location.includes('?')) location += search;
  // Internal targets stay relative: behind the proxy nextUrl.origin is the container address.
  if (/^https?:\/\//i.test(location) === false && normalize(location.split('?')[0]) === normalize(pathname)) {
    return NextResponse.next();
  }

  const status = [301, 302, 307, 308].includes(rule.status) ? rule.status : 301;
  return new NextResponse(null, {
    status,
    headers: { Location: encodeLocation(location), 'X-Redirect-By': 'banovit', 'Cache-Control': 'public, max-age=300' },
  });
}

/** Location must be ASCII: percent-encode Persian characters, keep existing escapes. */
function encodeLocation(url: string): string {
  return url.replace(/[^!-~]/gu, (c) => encodeURIComponent(c)).replace(/%[0-9A-F]{2}/g, (m) => m.toLowerCase());
}

export const config = {
  // Pages only: not Next internals, the BFF API, or files with an extension (images, sitemaps are handled by their routes).
  matcher: ['/((?!_next/|api/|favicon\\.ico|robots\\.txt|.*\\.(?:png|jpe?g|gif|webp|avif|svg|ico|css|js|map|txt|woff2?)$).*)'],
};
