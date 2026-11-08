import 'server-only';
import type { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { stripMiddlewareCookieHeader } from '@/lib/http/cookies';

/**
 * Runs after a successful login. Contract with the cart thread
 * (feature/web-cart): the guest cart token is in the httpOnly `bnv_cart`
 * cookie; CMS POST /cart/merge {guest_token} (customer Bearer) merges it into
 * the customer's active cart and returns {data: {token, ...}}. A failed merge
 * never fails the login; 404 = no guest cart / endpoint not deployed yet.
 */
export const CART_COOKIE = 'bnv_cart';

export async function mergeGuestCartOnLogin(req: NextRequest, res: NextResponse, token: string, clientIp: string): Promise<void> {
  const guestToken = req.cookies.get(CART_COOKIE)?.value;
  if (!guestToken) return;

  const merged = await fetch(`${env.apiUrl}/cart/merge`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'X-Storefront-Token': env.apiToken,
      'X-Client-IP': clientIp,
    },
    body: JSON.stringify({ guest_token: guestToken }),
    cache: 'no-store',
    signal: AbortSignal.timeout(8000),
  }).catch(() => null);

  if (!merged || !merged.ok) return;

  const body = (await merged.json().catch(() => null)) as { data?: { token?: string } } | null;
  const cartToken = body?.data?.token;
  if (cartToken) {
    res.cookies.set(CART_COOKIE, cartToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });
  } else {
    // Signed-in carts resolve by customer on the CMS side.
    res.cookies.set(CART_COOKIE, '', { path: '/', maxAge: 0 });
  }
  stripMiddlewareCookieHeader(res);
}
