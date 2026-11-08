import { NextResponse, type NextRequest } from 'next/server';
import { cartClient, cartSession, errorResponse, orderTokenFor, readJson } from '@/lib/cart/server';

export const dynamic = 'force-dynamic';

/** «تلاش مجدد» on the failed-payment page. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  const { payment_method } = await readJson(req);
  try {
    const r = await cartClient.payOrder(
      await cartSession({ orderToken: await orderTokenFor(number) }),
      number,
      typeof payment_method === 'string' ? payment_method : undefined,
    );
    return NextResponse.json({ data: r }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    return errorResponse(e);
  }
}
