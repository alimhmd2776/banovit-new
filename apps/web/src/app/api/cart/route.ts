import type { NextRequest } from 'next/server';
import type { CartUpdate } from '@banovit/api-client';
import { cartClient, cartResponse, cartSession, errorResponse, readJson } from '@/lib/cart/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return cartResponse(await cartClient.getCart(await cartSession()));
  } catch (e) {
    return errorResponse(e);
  }
}

const OPTION_KEYS = ['packaging', 'delivery_date', 'address', 'address_id', 'payment_method', 'customer_note', 'attribution'] as const;

export async function PATCH(req: NextRequest) {
  const body = await readJson(req);
  const update: Record<string, unknown> = {};
  for (const k of OPTION_KEYS) if (k in body) update[k] = body[k];
  try {
    return cartResponse(await cartClient.updateCart(await cartSession(), update as CartUpdate));
  } catch (e) {
    return errorResponse(e);
  }
}
