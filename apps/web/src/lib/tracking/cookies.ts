/**
 * Visitor attribution from cookies (same cookies and formats as the old WordPress
 * site, so a visitor's first touch survives the move to the new site):
 *  - bnv_attr  {first, last, hist}: touches written by AttributionCapture (= bnv-capture.js)
 *  - bnv_lc    the session lead_code (BN-XXXX), 30-minute sliding (LeadCode = bnv-leadcode.js)
 *  - _ga / _ga_<stream>   GA4 client id, session id + number
 *  - _pk_id.<site>.<hash> Matomo visitor id
 * Pure functions (no next/headers) so they are unit-tested and usable in route handlers.
 */

export type Touch = {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
  id?: string;
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
  fbclid?: string;
  msclkid?: string;
  referrer?: string;
  landing_page?: string;
  ts?: number;
  /** provisional "(direct)": the next real source replaces it */
  p?: number;
};

export type AttrCookie = { first?: Touch; last?: Touch; hist?: unknown[] };

export type AttributionSnapshot = {
  first_touch?: Touch;
  last_touch?: Touch;
  ga_client_id?: string;
  ga_session_id?: string;
  ga_session_number?: string;
  matomo_visitor_id?: string;
  lead_code?: string;
};

export const ATTR_COOKIE = 'bnv_attr';
export const LEAD_CODE_COOKIE = 'bnv_lc';
export const LEAD_CODE_RE = /^BN-[2-9A-HJKMNP-Z]{4}$/;

type Jar = { name: string; value: string }[];

function decode(v: string): string {
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
}

export function parseAttrCookie(raw: string | undefined | null): AttrCookie {
  if (!raw) return {};
  try {
    // Next already decodes cookie values; a raw header value is still URI-encoded.
    const v = JSON.parse(raw.trimStart().startsWith('{') ? raw : decode(raw)) as unknown;
    return v && typeof v === 'object' ? (v as AttrCookie) : {};
  } catch {
    return {};
  }
}

/** _ga = GA1.1.<random>.<ts> → "<random>.<ts>" */
export function gaClientId(value: string | undefined): string | undefined {
  const m = value ? /^GA\d\.\d+\.(\d+\.\d+)$/.exec(decode(value)) : null;
  return m?.[1];
}

/** _ga_<stream>: old GS1.1.<sid>.<num>… and 2025 GS2.1.s<sid>$o<num>$g… formats. */
export function gaSession(value: string | undefined): { id?: string; number?: string } {
  if (!value) return {};
  const v = decode(value);
  const m = /^GS2\.\d+\.s(\d+)\$o(\d+)/.exec(v) ?? /^GS1\.\d+\.(\d+)\.(\d+)/.exec(v);
  return m ? { id: m[1], number: m[2] } : {};
}

/** _pk_id.<siteId>.<hash> = <16 hex visitor id>.<ts>… */
export function matomoVisitorId(jar: Jar, siteId?: string | null): string | undefined {
  for (const c of jar) {
    if (!c.name.startsWith('_pk_id')) continue;
    const site = c.name.slice('_pk_id'.length + 1).split(/[._]/)[0];
    if (siteId && site && site !== String(siteId)) continue;
    const m = /^([0-9a-f]{16})\./i.exec(decode(c.value));
    if (m) return m[1]!.toLowerCase();
  }
  return undefined;
}

function cleanTouch(t: Touch | undefined): Touch | undefined {
  if (!t || typeof t !== 'object' || typeof t.source !== 'string' || !t.source) return undefined;
  const out: Touch = {};
  for (const k of ['source', 'medium', 'campaign', 'term', 'content', 'id', 'gclid', 'gbraid', 'wbraid', 'fbclid', 'msclkid', 'referrer', 'landing_page'] as const) {
    const v = t[k];
    if (typeof v === 'string' && v !== '') out[k] = v.slice(0, 500);
  }
  if (typeof t.ts === 'number' || (typeof t.ts === 'string' && /^\d+$/.test(t.ts))) out.ts = Number(t.ts);
  return out;
}

/** Everything the CMS needs to attribute an order / lead to this visitor. */
export function attributionFromCookies(jar: Jar, ids: { ga4MeasurementId?: string | null; matomoSiteId?: string | null } = {}): AttributionSnapshot {
  const get = (n: string) => jar.find((c) => c.name === n)?.value;
  const attr = parseAttrCookie(get(ATTR_COOKIE));
  const stream = ids.ga4MeasurementId ? `_ga_${ids.ga4MeasurementId.replace(/^G-/, '')}` : null;
  const gaS = gaSession((stream ? get(stream) : undefined) ?? jar.find((c) => c.name.startsWith('_ga_'))?.value);
  const code = (get(LEAD_CODE_COOKIE) ?? '').toUpperCase();

  const snap: AttributionSnapshot = {
    first_touch: cleanTouch(attr.first),
    last_touch: cleanTouch(attr.last),
    ga_client_id: gaClientId(get('_ga')),
    ga_session_id: gaS.id,
    ga_session_number: gaS.number,
    matomo_visitor_id: matomoVisitorId(jar, ids.matomoSiteId),
    lead_code: LEAD_CODE_RE.test(code) ? code : undefined,
  };
  for (const k of Object.keys(snap) as (keyof AttributionSnapshot)[]) if (snap[k] === undefined) delete snap[k];
  return snap;
}
