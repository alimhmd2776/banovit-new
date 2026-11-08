import type { NextRequest } from 'next/server';
import { cartClient, cartResponse, cartSession, errorResponse, readJson } from '@/lib/cart/server';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const id = Number((await params).id);
  const b = await readJson(req);
  try {
    const cart = await cartClient.updateCartItem(await cartSession(), id, {
      quantity: typeof b.quantity === 'number' ? b.quantity : undefined,
      installation: typeof b.installation === 'boolean' ? b.installation : undefined,
    });
    return cartResponse(cart);
  } catch (e) {
    return errorResponse(e);
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    return cartResponse(await cartClient.removeCartItem(await cartSession(), Number((await params).id)));
  } catch (e) {
    return errorResponse(e);
  }
}
