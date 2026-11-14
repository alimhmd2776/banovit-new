/**
 * lead_code, a port of the old site's bnv-leadcode.js (tracking contract v1 §2, §7).
 * One short code per browser session (e.g. BN-7K3Q, cookie bnv_lc, 30-minute sliding). It is:
 *  - prefilled into WhatsApp / SMS links and shown next to phone links, so sales can ask
 *    «کد پیگیری؟» and link the call to the visit;
 *  - registered once with the CMS (/api/web-identity → web_identity) with the GA4 / Matomo ids
 *    and the bnv_attr touches, so a phone / offline order gets the visitor's web channel;
 *  - pushed to the dataLayer as lead_code_shown / contact_click (+ phone_click / whatsapp_click,
 *    and the Google Ads contact conversions, like the old site).
 */
import { adsConversion, pushDataLayer } from '@/lib/analytics';
import { LEAD_CODE_COOKIE } from './cookies';
import { readCookie, writeCookie } from './capture';

const ALPHA = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'; // no 0/O/1/I/L
const SESSION_SECONDS = 30 * 60;
const ENDPOINT = '/api/web-identity/';
const MESSAGE = 'سلام، کد پیگیری من: {code}';

export type ContactMethod = 'phone' | 'sms' | 'whatsapp' | 'telegram' | 'bale' | 'rubika' | 'instagram' | 'eitaa';

export function methodFor(href: string): ContactMethod | '' {
  if (/^tel:/i.test(href)) return 'phone';
  if (/^sms:/i.test(href)) return 'sms';
  if (/^whatsapp:|wa\.me|whatsapp\.com/i.test(href)) return 'whatsapp';
  if (/t\.me|telegram\.(me|org)/i.test(href)) return 'telegram';
  if (/ble\.ir|bale\.ai/i.test(href)) return 'bale';
  if (/rubika\.ir/i.test(href)) return 'rubika';
  if (/instagram\.com|ig\.me/i.test(href)) return 'instagram';
  if (/eitaa\.com/i.test(href)) return 'eitaa';
  return '';
}

export function newCode(): string {
  const a = new Uint8Array(4);
  crypto.getRandomValues(a);
  let s = '';
  for (const b of a) s += ALPHA[b % ALPHA.length];
  return 'BN-' + s;
}

let code = '';

export function currentLeadCode(): string {
  return code;
}

function send(body: Record<string, unknown>, beacon = false) {
  const json = JSON.stringify({ lead_code: code, page: location.href.slice(0, 500), ...body });
  try {
    if (beacon && navigator.sendBeacon) {
      navigator.sendBeacon(ENDPOINT, new Blob([json], { type: 'application/json' }));
      return;
    }
    void fetch(ENDPOINT, { method: 'POST', credentials: 'same-origin', keepalive: true, headers: { 'Content-Type': 'application/json' }, body: json }).catch(() => undefined);
  } catch {
    /* best effort */
  }
}

/** Icon-only links get no label (it would inherit the icon size and overflow). */
function hasVisibleText(a: Element): boolean {
  if (a.getAttribute('tabindex') === '-1' || a.getAttribute('aria-hidden') === 'true') return false;
  if (a.closest('[data-bnv-lc-label="off"]')) return false;
  return !!(a.textContent ?? '').replace(/\s+/g, '');
}

/** Small one-line label; the code is an LTR isolate so RTL text can't split "BN-XXXX". */
function phoneLabel(): HTMLElement {
  const s = document.createElement('small');
  s.className = 'bnv-lead-code bnv-lead-code--inline';
  s.style.cssText = 'display:inline-block;font-size:12px;line-height:1.5;font-weight:400;white-space:nowrap;vertical-align:middle;margin-inline-start:4px;opacity:.8;letter-spacing:0;text-transform:none';
  s.append('(کد پیگیری: ');
  const b = document.createElement('bdi');
  b.dir = 'ltr';
  b.style.unicodeBidi = 'isolate';
  b.textContent = code;
  s.append(b, ')');
  return s;
}

function decorate(a: HTMLAnchorElement) {
  if (a.dataset.bnvLc) return;
  const href = a.getAttribute('href') ?? '';
  const m = methodFor(href);
  if (!m) return;
  a.dataset.bnvLc = m;
  const msg = MESSAGE.replace('{code}', code);
  try {
    if (m === 'whatsapp' && /^https?:/i.test(href)) {
      const u = new URL(href, location.href);
      // wa.me/09xx… does not open a chat: international format (old site's waFix)
      const local = /^\/0(9\d{9})\/?$/.exec(u.pathname);
      if (u.hostname === 'wa.me' && local) u.pathname = '/98' + local[1];
      const p = u.searchParams.get('phone') ?? '';
      if (/^09\d{9}$/.test(p)) u.searchParams.set('phone', '98' + p.slice(1));
      u.searchParams.set('text', (u.searchParams.get('text') ? u.searchParams.get('text') + '\n' : '') + msg);
      a.setAttribute('href', u.toString());
    } else if (m === 'sms') {
      a.setAttribute('href', href.split('?')[0] + '?body=' + encodeURIComponent(msg));
    }
  } catch {
    /* leave the link untouched */
  }
  if (m === 'phone' && !a.querySelector('.bnv-lead-code') && hasVisibleText(a)) a.appendChild(phoneLabel());
}

function fill() {
  document.querySelectorAll<HTMLElement>('[data-bnv-lead-code]').forEach((n) => {
    if (n.textContent !== code) n.textContent = code;
  });
  document.querySelectorAll<HTMLAnchorElement>('a[href]').forEach(decorate);
}

function position(el: Element): string {
  return el.closest('header') ? 'header' : el.closest('footer') ? 'footer' : 'body';
}

let lastClick: Record<string, number> = {};

function onClick(e: MouseEvent) {
  const a = (e.target as Element | null)?.closest?.('a[data-bnv-lc]') as HTMLAnchorElement | null;
  if (!a) return;
  const method = a.dataset.bnvLc as ContactMethod;
  touchSession();
  pushDataLayer({ event: 'contact_click', contact_method: method, lead_code: code });
  if (method === 'phone' || method === 'whatsapp') {
    const ev = method === 'phone' ? 'phone_click' : 'whatsapp_click';
    const pos = position(a);
    const key = ev + '|' + pos;
    if (!lastClick[key] || Date.now() - lastClick[key]! > 3000) {
      lastClick = { ...lastClick, [key]: Date.now() };
      pushDataLayer({ event: ev, component_position: pos, lead_code: code });
      adsConversion(ev, {});
    }
  }
  // sms / eitaa are not web_identity contact methods on the CMS
  if (method !== 'sms' && method !== 'eitaa') send({ contact_method: method }, true);
}

/** Keeps the 30-minute session alive; a new session gets a new code (and is registered). */
function touchSession(): boolean {
  const existing = (readCookie(LEAD_CODE_COOKIE) ?? '').toUpperCase();
  const isNew = !/^BN-[2-9A-HJKMNP-Z]{4}$/.test(existing);
  code = isNew ? newCode() : existing;
  writeCookie(LEAD_CODE_COOKIE, code, SESSION_SECONDS);
  return isNew;
}

let started = false;

/** Call once on the first page load (after captureAttribution, so the touch goes with it). */
export function startLeadCode() {
  if (started || typeof window === 'undefined') return;
  started = true;
  try {
    const isNew = touchSession();
    fill();
    pushDataLayer({ event: 'lead_code_shown', lead_code: code });
    if (isNew) send({ kind: 'session' });
    document.addEventListener('click', onClick, true);
    // client navigations and lazy widgets add links later
    let t: ReturnType<typeof setTimeout> | undefined;
    new MutationObserver(() => {
      clearTimeout(t);
      t = setTimeout(fill, 300);
    }).observe(document.body, { childList: true, subtree: true });
  } catch {
    /* never break the page */
  }
}

/** On each client navigation: slide the session (a new code after 30 idle minutes). */
export function onNavigation() {
  if (!started) return;
  try {
    const isNew = touchSession();
    if (isNew) {
      document.querySelectorAll('.bnv-lead-code--inline bdi').forEach((b) => (b.textContent = code));
      fill();
      send({ kind: 'session' });
    }
  } catch {
    /* ignore */
  }
}
