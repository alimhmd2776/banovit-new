import { describe, expect, it } from 'vitest';
import { currentTouch, nextAttr } from './capture';
import { attributionFromCookies, gaClientId, gaSession, matomoVisitorId } from './cookies';
import { methodFor } from './leadcode';
import { irrToTry } from '@/lib/analytics';

const now = Date.UTC(2026, 10, 20, 8, 0, 0); // after the Arvan challenge cut-off

describe('currentTouch (port of bnv-capture.js)', () => {
  it('gclid without utm is google / cpc', () => {
    const t = currentTouch({ href: 'https://banovit.com/product/x/?gclid=Cj0abc', referrer: '', now });
    expect(t).toMatchObject({ source: 'google', medium: 'cpc', gclid: 'Cj0abc', landing_page: 'https://banovit.com/product/x/?gclid=Cj0abc' });
  });
  it('google referrer is organic, instagram is social, other site is referral', () => {
    expect(currentTouch({ href: 'https://banovit.com/', referrer: 'https://www.google.com/', now })).toMatchObject({ source: 'google', medium: 'organic' });
    expect(currentTouch({ href: 'https://banovit.com/', referrer: 'https://l.instagram.com/', now })).toMatchObject({ source: 'instagram', medium: 'social' });
    expect(currentTouch({ href: 'https://banovit.com/', referrer: 'https://www.digikala.com/x', now })).toMatchObject({ source: 'digikala.com', medium: 'referral' });
  });
  it('utm wins; missing medium is referral', () => {
    expect(currentTouch({ href: 'https://banovit.com/?utm_source=Bale&utm_campaign=nov', referrer: 'https://www.google.com/', now })).toMatchObject({ source: 'bale', medium: 'referral', campaign: 'nov' });
  });
  it('internal, subdomain and payment-gateway referrers are not touches', () => {
    expect(currentTouch({ href: 'https://banovit.com/cart/', referrer: 'https://banovit.com/', now })).toBeNull();
    expect(currentTouch({ href: 'https://new.banovit.com/cart/', referrer: 'https://cms.banovit.com/', now })).toBeNull();
    expect(currentTouch({ href: 'https://banovit.com/checkout/result/', referrer: 'https://www.zarinpal.com/pg/StartPay/1', now })).toBeNull();
    expect(currentTouch({ href: 'https://banovit.com/', referrer: '', now })).toBeNull();
  });
});

describe('nextAttr', () => {
  it('first touch is kept, last touch moves, provisional direct is replaced', () => {
    const a1 = nextAttr({}, { href: 'https://banovit.com/', referrer: '', now })!;
    expect(a1.first).toMatchObject({ source: '(direct)' });
    expect(a1.first?.p).toBeUndefined();
    const a2 = nextAttr(a1, { href: 'https://banovit.com/?utm_source=instagram&utm_medium=social', referrer: '', now })!;
    expect(a2.first?.source).toBe('(direct)'); // a real direct first visit stays
    expect(a2.last).toMatchObject({ source: 'instagram' });
    const a3 = nextAttr(a2, { href: 'https://banovit.com/?gclid=abc', referrer: '', now })!;
    expect(a3.last).toMatchObject({ source: 'google', medium: 'cpc' });
    expect(a3.hist).toHaveLength(2);
    // same touch again: no change
    expect(nextAttr(a3, { href: 'https://banovit.com/?gclid=abc', referrer: '', now })).toBeNull();
    // provisional first (self referrer) is replaced
    const p = nextAttr({}, { href: 'https://banovit.com/', referrer: 'https://banovit.com/', now })!;
    expect(p.first?.p).toBe(1);
    expect(nextAttr(p, { href: 'https://banovit.com/', referrer: 'https://www.google.com/', now })!.first).toMatchObject({ source: 'google', medium: 'organic' });
  });
  it('a direct first touch from before the challenge cut-off becomes provisional', () => {
    const old = { first: { source: '(direct)', medium: '(none)', ts: 1793000000 } };
    expect(nextAttr(old, { href: 'https://banovit.com/', referrer: 'https://www.google.com/', now })!.first?.source).toBe('google');
  });
});

describe('cookies', () => {
  it('GA4 client and session ids, both _ga_ formats', () => {
    expect(gaClientId('GA1.1.123456789.1789000000')).toBe('123456789.1789000000');
    expect(gaSession('GS2.1.s1789100000$o12$g1$t1789100100$j60$l0$h0')).toEqual({ id: '1789100000', number: '12' });
    expect(gaSession('GS1.1.1789100000.5.1.1789100100.0.0.0')).toEqual({ id: '1789100000', number: '5' });
  });
  it('Matomo visitor id of the right site', () => {
    const jar = [{ name: '_pk_id.2.abcd', value: '1111111111111111.1789' }, { name: '_pk_id.1.abcd', value: 'ABCDEF0123456789.1789000000.' }];
    expect(matomoVisitorId(jar, '1')).toBe('abcdef0123456789');
  });
  it('snapshot from a full jar', () => {
    const attr = JSON.stringify({ first: { source: 'google', medium: 'organic', ts: 1 }, last: { source: 'google', medium: 'cpc', gclid: 'x', junk: 1, ts: 2 } });
    const snap = attributionFromCookies(
      [
        { name: 'bnv_attr', value: attr },
        { name: 'bnv_lc', value: 'bn-7k3q' },
        { name: '_ga', value: 'GA1.1.1.2' },
        { name: '_ga_Q4HPMEWP6X', value: 'GS2.1.s99$o3$g0' },
      ],
      { ga4MeasurementId: 'G-Q4HPMEWP6X' },
    );
    expect(snap).toEqual({
      first_touch: { source: 'google', medium: 'organic', ts: 1 },
      last_touch: { source: 'google', medium: 'cpc', gclid: 'x', ts: 2 },
      ga_client_id: '1.2',
      ga_session_id: '99',
      ga_session_number: '3',
      lead_code: 'BN-7K3Q',
    });
    // URI-encoded raw value and garbage
    expect(attributionFromCookies([{ name: 'bnv_attr', value: encodeURIComponent(attr) }]).last_touch?.gclid).toBe('x');
    expect(attributionFromCookies([{ name: 'bnv_attr', value: '{bad' }, { name: 'bnv_lc', value: 'BN-0000' }])).toEqual({});
  });
});

describe('lead code helpers', () => {
  it('contact methods', () => {
    expect(methodFor('tel:02191000000')).toBe('phone');
    expect(methodFor('https://wa.me/989120000000')).toBe('whatsapp');
    expect(methodFor('https://t.me/banovit')).toBe('telegram');
    expect(methodFor('https://ble.ir/banovit')).toBe('bale');
    expect(methodFor('/shop/')).toBe('');
  });
  it('IRR to TRY', () => {
    expect(irrToTry(53_000_000, 53_000)).toBe(1000);
    expect(irrToTry(100, null)).toBeNull();
  });
});
