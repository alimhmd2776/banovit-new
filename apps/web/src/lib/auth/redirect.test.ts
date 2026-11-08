import { describe, expect, it } from 'vitest';
import { loginPath, safeRedirect } from './redirect';
import { normalizeMobile, toPersianDigits } from './phone';

describe('safeRedirect', () => {
  it.each([
    ['/cart/', '/cart/'],
    ['/my-account/orders/?page=2', '/my-account/orders/?page=2'],
    ['//evil.com', '/'],
    ['/\\evil.com', '/'],
    ['https://evil.com/', '/'],
    ['javascript:alert(1)', '/'],
    ['/login/', '/'],
    ['', '/'],
    [null, '/'],
  ])('%s → %s', (input, out) => expect(safeRedirect(input as string | null)).toBe(out));

  it('builds the login URL', () => {
    expect(loginPath('/cart/')).toBe('/login/?redirect=%2Fcart%2F');
    expect(loginPath('//evil')).toBe('/login/');
  });
});

describe('normalizeMobile', () => {
  it.each([
    ['09121234567', '09121234567'],
    ['۰۹۱۲ ۱۲۳ ۴۵۶۷', '09121234567'],
    ['+989121234567', '09121234567'],
    ['00989121234567', '09121234567'],
    ['9121234567', '09121234567'],
    ['02112345678', null],
    ['0912123', null],
  ])('%s → %s', (input, out) => expect(normalizeMobile(input)).toBe(out));

  it('formats Persian digits', () => expect(toPersianDigits('0:50')).toBe('۰:۵۰'));
});
