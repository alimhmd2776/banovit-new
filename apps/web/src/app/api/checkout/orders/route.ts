import { NextResponse, type NextRequest } from 'next/server';
import { cartClient, cartSession, clearCartCookies, errorResponse, setOrderCookie } from '@/lib/cart/server';

export const dynamic = 'force-dynamic';

/**
 * Place the order. The browser sends one Idempotency-Key per checkout attempt,
 * so a double tap or a retried request never creates two orders.
 */
export async function POST(req: NextRequest) {
  const key = req.headers.get('idempotency-key') ?? '';
  if (!/^[\w-]{8,100}$/.test(key)) {
    return NextResponse.json({ error: { code: 'bad_request', message: 'درخواست نامعتبر است.' } }, { status: 400 });
  }
  try {
    const placed = await cartClient.placeOrder(await cartSession({ idempotencyKey: key }));
    const res = NextResponse.json(
      { data: { order: placed.order, payment: placed.payment } },
      { status: placed.access_token ? 201 : 200, headers: { 'Cache-Control': 'no-store' } },
    );
    if (placed.access_token) setOrderCookie(res, placed.order.number, placed.access_token);
    clearCartCookies(res);
    return res;
  } catch (e) {
    return errorResponse(e);
  }
}
