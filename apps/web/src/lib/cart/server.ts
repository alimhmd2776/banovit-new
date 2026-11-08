import 'server-only';
import { cookies, headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { createStorefrontClient, StorefrontApiError, type Cart, type SessionHeaders } from '@banovit/api-client';
import { env } from '@/lib/env';

/**
 * BFF side of the cart (docs/api/cart.md). The browser never sees the CMS:
 * it calls /api/cart/* route handlers, which forward to /api/storefront/v1
 * with the cart token from the httpOnly `bnv_cart` cookie, the visitor IP and
 * the internal token. The signed-in customer's token (`bnv_session`, auth
 * thread) is forwarded as Bearer so the CMS attaches the cart to them.
 *
 * `bnv_cart_count` is a readable cookie with only the item count, so the
 * header/bottom-nav badge needs no request at all.
 */
export const CART_COOKIE = 'bnv_cart';
export const CART_COUNT_COOKIE = 'bnv_cart_count';
export const ORDER_COOKIE = 'bnv_order';
const SESSION_COOKIE = 'bnv_session';
const MAX_AGE = 60 * 60 * 24 * 60;

export const cartClient = createStorefrontClient({ baseUrl: env.apiUrl, internalToken: env.apiToken });

export async function cartSession(extra: Partial<SessionHeaders> = {}): Promise<SessionHeaders> {
  const jar = await cookies();
  const h = await headers();
  const session = jar.get(SESSION_COOKIE)?.value;
  return {
    cartToken: jar.get(CART_COOKIE)?.value ?? null,
    clientIp: h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? h.get('x-real-ip') ?? null,
    authorization: session ? `Bearer ${session}` : null,
    ...extra,
  };
}

/** Order access token saved after placing an order: "NUMBER:token". */
export async function orderTokenFor(number: string): Promise<string | null> {
  const raw = (await cookies()).get(ORDER_COOKIE)?.value;
  if (!raw) return null;
  const [n, t] = raw.split(':');
  return n === number && t ? t : null;
}

const cookieBase = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/' };

/** JSON response with the cart; keeps the token/count cookies in sync with it. */
export function cartResponse(cart: Cart, status = 200): NextResponse {
  const res = NextResponse.json({ data: cart }, { status, headers: { 'Cache-Control': 'no-store' } });
  syncCartCookies(res, cart);
  return res;
}

export function syncCartCookies(res: NextResponse, cart: Pick<Cart, 'token' | 'item_count'>) {
  if (cart.token) res.cookies.set(CART_COOKIE, cart.token, { ...cookieBase, maxAge: MAX_AGE });
  res.cookies.set(CART_COUNT_COOKIE, String(cart.item_count), { ...cookieBase, httpOnly: false, maxAge: MAX_AGE });
}

export function clearCartCookies(res: NextResponse) {
  res.cookies.delete(CART_COOKIE);
  res.cookies.set(CART_COUNT_COOKIE, '0', { ...cookieBase, httpOnly: false, maxAge: MAX_AGE });
}

export function setOrderCookie(res: NextResponse, number: string, token: string) {
  res.cookies.set(ORDER_COOKIE, `${number}:${token}`, { ...cookieBase, maxAge: 60 * 60 * 24 * 30 });
}

/** Map an API failure to the same {error} envelope for the browser. */
export function errorResponse(e: unknown): NextResponse {
  if (e instanceof StorefrontApiError) {
    const res = NextResponse.json({ error: { code: e.code, message: e.message, fields: e.fields } }, { status: e.status, headers: { 'Cache-Control': 'no-store' } });
    // The cookie points at a cart that no longer exists (converted / pruned).
    if (e.code === 'cart_not_found') clearCartCookies(res);
    return res;
  }
  return NextResponse.json(
    { error: { code: 'unavailable', message: 'ارتباط با فروشگاه برقرار نشد. لطفاً دوباره تلاش کنید.' } },
    { status: 502, headers: { 'Cache-Control': 'no-store' } },
  );
}

export async function readJson(req: Request): Promise<Record<string, unknown>> {
  try {
    const body = (await req.json()) as unknown;
    return body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

/** Server components (cart/checkout pages): the cart for the first paint, or null if the API is down. */
export async function loadCart(): Promise<Cart | null> {
  try {
    return await cartClient.getCart(await cartSession());
  } catch {
    return null;
  }
}
