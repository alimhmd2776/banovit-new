import type { NextRequest } from 'next/server';
import { cartClient, cartResponse, cartSession, errorResponse, readJson } from '@/lib/cart/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const { code } = await readJson(req);
  try {
    return cartResponse(await cartClient.applyCoupon(await cartSession(), String(code ?? '').slice(0, 64)));
  } catch (e) {
    return errorResponse(e);
  }
}

export async function DELETE() {
  try {
    return cartResponse(await cartClient.removeCoupon(await cartSession()));
  } catch (e) {
    return errorResponse(e);
  }
}
