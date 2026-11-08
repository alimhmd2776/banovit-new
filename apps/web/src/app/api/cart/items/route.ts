import type { NextRequest } from 'next/server';
import { cartClient, cartResponse, cartSession, errorResponse, readJson } from '@/lib/cart/server';

export const dynamic = 'force-dynamic';

const int = (v: unknown) => (typeof v === 'number' && Number.isInteger(v) ? v : typeof v === 'string' && /^\d+$/.test(v) ? Number(v) : undefined);

/** Add to cart. Body: {product_id, variation_id|variant_id, quantity, installation?, addon_ids?} */
export async function POST(req: NextRequest) {
  const b = await readJson(req);
  const productId = int(b.product_id);
  if (!productId) {
    return Response.json({ error: { code: 'bad_request', message: 'کالا مشخص نیست.' } }, { status: 400 });
  }
  try {
    const cart = await cartClient.addCartItem(await cartSession(), {
      product_id: productId,
      variation_id: int(b.variation_id) ?? int(b.variant_id) ?? null,
      quantity: int(b.quantity) ?? 1,
      installation: typeof b.installation === 'boolean' ? b.installation : undefined,
      addon_ids: Array.isArray(b.addon_ids) ? b.addon_ids.map(int).filter((x): x is number => x !== undefined) : undefined,
    });
    return cartResponse(cart, 201);
  } catch (e) {
    return errorResponse(e);
  }
}
