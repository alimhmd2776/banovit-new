/**
 * First / last touch capture, a port of the old site's bnv-capture.js (banovit-attribution
 * plugin) with the SAME cookie (bnv_attr, 90 days, {first, last, hist}), so visitors who
 * came to banovit.com before the move keep their first touch on the new site.
 *  - first: first touch, written once (a provisional "(direct)" is replaced by the next real source)
 *  - last : last NON-direct touch (UTM, click id or external referrer)
 *  - hist : last 5 touches
 * Payment-gateway returns (Zarinpal/Shaparak) and internal navigation never write a touch.
 * Runs once per full page load (client navigations keep document.referrer, so they are not new touches).
 */
import { ATTR_COOKIE, parseAttrCookie, type AttrCookie, type Touch } from './cookies';

const DAYS = 90;
const CHALLENGE_OFF_TS = 1793886660;
const SEARCH = ['google', 'bing', 'yahoo', 'duckduckgo', 'yandex', 'ecosia', 'baidu', 'zarebin'];
const SOCIAL: Record<string, string> = {
  instagram: 'instagram', facebook: 'facebook', 'fb.com': 'facebook', 't.me': 'telegram', telegram: 'telegram',
  'bale.ai': 'bale', 'ble.ir': 'bale', rubika: 'rubika', eitaa: 'eitaa', whatsapp: 'whatsapp', 'wa.me': 'whatsapp',
  linkedin: 'linkedin', 'lnkd.in': 'linkedin', twitter: 'twitter', 'x.com': 'twitter', 't.co': 'twitter',
  youtube: 'youtube', aparat: 'aparat', pinterest: 'pinterest', virgool: 'virgool',
};
const GATEWAY = /(zarinpal|shaparak|zibal|idpay|payping|nextpay|sep\.ir|bpm\.|mellat|sadad|pec\.ir|asanpardakht|irankish)/i;

export function readCookie(name: string): string | null {
  const m = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/[.$?*|{}()[\]\\/+^]/g, '\\$&') + '=([^;]*)'));
  if (!m) return null;
  try {
    return decodeURIComponent(m[1]!);
  } catch {
    return m[1]!;
  }
}

export function writeCookie(name: string, value: string, maxAgeSeconds: number) {
  document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAgeSeconds}; path=/; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
}

function classify(refHost: string): [string, string] {
  for (const s of SEARCH) if (refHost.includes(s + '.')) return [s, 'organic'];
  for (const k of Object.keys(SOCIAL)) if (refHost.includes(k)) return [SOCIAL[k]!, 'social'];
  return [refHost.replace(/^www\./, ''), 'referral'];
}

type Env = { href: string; referrer: string; now: number };

/** The touch of this landing, or null for direct / internal / gateway traffic. Exported for tests. */
export function currentTouch(env: Env): Touch | null {
  const url = new URL(env.href);
  const host = url.hostname.replace(/^www\./, '').toLowerCase();
  const rootHost = host.split('.').slice(-2).join('.'); // banovit.com: subdomains are internal
  const q = url.searchParams;
  const g = (k: string) => (q.get(k) ?? '').slice(0, 200);
  const t: Touch = {
    source: g('utm_source') || g('mtm_source'),
    medium: g('utm_medium') || g('mtm_medium'),
    campaign: g('utm_campaign') || g('mtm_campaign') || g('pk_campaign'),
    term: g('utm_term') || g('mtm_keyword'),
    content: g('utm_content') || g('mtm_content'),
    id: g('utm_id'),
    gclid: g('gclid'), gbraid: g('gbraid'), wbraid: g('wbraid'), fbclid: g('fbclid'), msclkid: g('msclkid'),
    referrer: '',
    landing_page: (url.origin + url.pathname + url.search).slice(0, 500),
    ts: Math.floor(env.now / 1000),
  };
  let refHost = '';
  try {
    refHost = env.referrer ? new URL(env.referrer).hostname.toLowerCase() : '';
  } catch {
    refHost = '';
  }
  const external = !!refHost && refHost.replace(/^www\./, '') !== host && refHost.slice(-rootHost.length) !== rootHost && !GATEWAY.test(refHost);
  if (external) t.referrer = env.referrer.slice(0, 500);
  const click = t.gclid || t.gbraid || t.wbraid;
  if (!t.source) {
    if (click) [t.source, t.medium] = ['google', 'cpc'];
    else if (t.msclkid) [t.source, t.medium] = ['bing', 'cpc'];
    else if (external) [t.source, t.medium] = classify(refHost);
    else return null;
  } else if (!t.medium) {
    t.medium = click ? 'cpc' : 'referral';
  }
  t.source = t.source!.toLowerCase();
  t.medium = t.medium!.toLowerCase();
  // keep the cookie small: drop empty keys
  for (const k of Object.keys(t) as (keyof Touch)[]) if (t[k] === '') delete t[k];
  return t;
}

/** New bnv_attr value for this landing, or null when nothing changes. Exported for tests. */
export function nextAttr(attr: AttrCookie, env: Env): AttrCookie | null {
  const touch = currentTouch(env);
  const a: AttrCookie = { ...attr };
  let changed = false;
  // A "(direct)" first touch written before the ArvanCloud site-wide challenge was switched off
  // (2026-11-05 13:51 UTC) is unreliable (the challenge reload hid the referrer): provisional.
  if (a.first && a.first.source === '(direct)' && !a.first.p && (Number(a.first.ts) || 0) < CHALLENGE_OFF_TS) {
    a.first = { ...a.first, p: 1 };
    changed = true;
  }
  let selfReferrer = false;
  try {
    const host = new URL(env.href).hostname.replace(/^www\./, '').toLowerCase();
    const rootHost = host.split('.').slice(-2).join('.');
    const rh = env.referrer ? new URL(env.referrer).hostname.toLowerCase() : '';
    selfReferrer = !!rh && (rh.replace(/^www\./, '') === host || rh.slice(-rootHost.length) === rootHost);
  } catch {
    selfReferrer = false;
  }
  if (touch) {
    if (!a.first || a.first.p) {
      a.first = touch;
      changed = true;
    }
    const last = a.last;
    const same = last && last.source === touch.source && last.medium === touch.medium && (last.campaign ?? '') === (touch.campaign ?? '') && (last.gclid ?? '') === (touch.gclid ?? '');
    if (!same) {
      a.last = touch;
      a.hist = [...(Array.isArray(a.hist) ? a.hist : []), [touch.source, touch.medium, touch.campaign ?? '', touch.ts]].slice(-5);
      changed = true;
    }
  } else if (!a.first) {
    // Remember that the very first visit was direct, so a later campaign isn't taken as first touch.
    // A self-referrer on the very first page means the real referrer was lost (reload), so it stays provisional.
    a.first = { source: '(direct)', medium: '(none)', landing_page: env.href.slice(0, 500), ts: Math.floor(env.now / 1000) };
    if (selfReferrer) a.first.p = 1;
    changed = true;
  }
  return changed ? a : null;
}

export function captureAttribution() {
  try {
    const next = nextAttr(parseAttrCookie(readCookie(ATTR_COOKIE)), { href: location.href, referrer: document.referrer, now: Date.now() });
    if (!next) return;
    let json = JSON.stringify(next);
    if (json.length > 3500) {
      delete next.hist;
      json = JSON.stringify(next);
    }
    writeCookie(ATTR_COOKIE, json, DAYS * 86400);
  } catch {
    /* never break the page */
  }
}
