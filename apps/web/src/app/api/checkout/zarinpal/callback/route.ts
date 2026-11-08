import { NextResponse, type NextRequest } from 'next/server';
import { cartClient, cartSession } from '@/lib/cart/server';
import { env } from '@/lib/env';

export const dynamic = 'force-dynamic';

/**
 * Zarinpal sends the customer back here (?Authority=…&Status=OK|NOK). The CMS
 * verifies with the gateway; we only redirect to the result page.
 */
export async function GET(req: NextRequest) {
  const authority = req.nextUrl.searchParams.get('Authority') ?? '';
  const status = req.nextUrl.searchParams.get('Status') ?? '';
  const target = new URL('/checkout/result/', env.siteUrl);
  try {
    const r = await cartClient.verifyZarinpal(await cartSession(), authority, status);
    target.searchParams.set('order', r.order.number);
    target.searchParams.set('status', r.paid ? 'success' : 'failed');
    if (r.ref_id) target.searchParams.set('ref', r.ref_id);
  } catch {
    target.searchParams.set('status', 'failed');
  }
  return NextResponse.redirect(target, 303);
}
