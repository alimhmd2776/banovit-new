import type { NextResponse } from 'next/server';

/**
 * NextResponse.cookies.set() also writes every cookie (value included) into an
 * `x-middleware-set-cookie` response header. That header is meant for
 * middleware; in a route handler it reaches the browser, where same-origin
 * fetch() can read it, defeating httpOnly. Call this after the last
 * cookies.set() on a route-handler response.
 */
export function stripMiddlewareCookieHeader<T extends NextResponse>(res: T): T {
  res.headers.delete('x-middleware-set-cookie');
  return res;
}
