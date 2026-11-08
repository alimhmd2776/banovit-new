import { describe, expect, it } from 'vitest';
import { NextResponse } from 'next/server';
import { stripMiddlewareCookieHeader } from './cookies';

describe('stripMiddlewareCookieHeader', () => {
  it('keeps Set-Cookie but drops the readable x-middleware-set-cookie copy', () => {
    const res = NextResponse.json({ ok: true });
    res.cookies.set('bnv_session', '12|secret', { httpOnly: true, path: '/' });
    expect(res.headers.get('x-middleware-set-cookie')).toContain('bnv_session=12%7Csecret');
    stripMiddlewareCookieHeader(res);
    expect(res.headers.get('x-middleware-set-cookie')).toBeNull();
    expect(res.headers.get('set-cookie')).toContain('bnv_session=12%7Csecret');
  });
});
