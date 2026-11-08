import 'server-only';
import { cache } from 'react';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import type { NextResponse } from 'next/server';
import type { Customer } from '@banovit/api-client';
import { env } from '@/lib/env';
import { stripMiddlewareCookieHeader } from '@/lib/http/cookies';
import { loginPath } from './redirect';

/**
 * Customer session (docs/api/auth.md). The CMS Sanctum token lives only in
 * this httpOnly cookie; browser JS never sees it. Route handlers and server
 * components call the CMS with customerHeaders().
 */
export const SESSION_COOKIE = 'bnv_session';

export async function getSessionToken(): Promise<string | null> {
  const value = (await cookies()).get(SESSION_COOKIE)?.value;
  return value && /^\d+\|[A-Za-z0-9]{20,}$/.test(value) ? value : null;
}

/**
 * Visitor IP for the CMS rate limits. X-Real-IP is set by our nginx from
 * $remote_addr; the first X-Forwarded-For hop is client-controlled, so it is
 * only a fallback (local dev without nginx).
 */
export function clientIpFrom(h: Headers): string {
  return h.get('x-real-ip')?.trim() || h.get('x-forwarded-for')?.split(',')[0]?.trim() || '';
}

/** Headers for any CMS call made for the current visitor. */
export async function customerHeaders(token?: string | null): Promise<Record<string, string>> {
  const t = token === undefined ? await getSessionToken() : token;
  const h: Record<string, string> = {
    Accept: 'application/json',
    'X-Storefront-Token': env.apiToken,
    'X-Client-IP': clientIpFrom(await headers()),
  };
  if (t) h.Authorization = `Bearer ${t}`;
  return h;
}

/** The signed-in customer, or null (no cookie, expired or revoked token). One CMS call per request. */
export const getCustomer = cache(async (): Promise<Customer | null> => {
  const token = await getSessionToken();
  if (!token) return null;
  const res = await fetch(`${env.apiUrl}/me`, { headers: await customerHeaders(token), cache: 'no-store' }).catch(() => null);
  if (!res || !res.ok) return null;
  return ((await res.json()) as { data: Customer }).data;
});

/** For account pages: the customer, or a redirect to /login/?redirect=nextPath. */
export async function requireCustomer(nextPath: string): Promise<Customer> {
  const customer = await getCustomer();
  if (!customer) redirect(loginPath(nextPath));
  return customer;
}

export function setSessionCookie(res: NextResponse, token: string, expiresAt: string): void {
  const expires = new Date(expiresAt);
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: Number.isNaN(expires.getTime()) ? new Date(Date.now() + 30 * 864e5) : expires,
  });
  stripMiddlewareCookieHeader(res);
}

export function clearSessionCookie(res: NextResponse): void {
  res.cookies.set(SESSION_COOKIE, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 0 });
  stripMiddlewareCookieHeader(res);
}
