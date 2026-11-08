'use client';

import type { Cart, CartUpdate, OrderSummary, PaymentStart } from '@banovit/api-client';
import { rialToToman } from '@banovit/ui';
import { track, type AnalyticsItem } from '@/lib/analytics';

/**
 * Browser-side cart API: calls the Next.js BFF (/api/cart/*), never the CMS.
 * Every mutation resolves to the full Cart and broadcasts `cart:updated`
 * ({detail: {item_count}}) so the header/bottom-nav badges refresh.
 */
export class CartError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly fields?: Record<string, string[]>,
  ) {
    super(message);
  }
}

async function call<T>(method: string, path: string, body?: unknown, headers?: Record<string, string>): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      method,
      headers: { Accept: 'application/json', ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}), ...headers },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: 'no-store',
      credentials: 'same-origin',
    });
  } catch {
    throw new CartError(0, 'network', 'اتصال اینترنت را بررسی کنید و دوباره تلاش کنید.');
  }
  const json = (await res.json().catch(() => null)) as { data?: T; error?: { code: string; message: string; fields?: Record<string, string[]> } } | null;
  if (!res.ok || !json?.data) {
    if (res.status === 429) throw new CartError(429, 'rate_limited', 'درخواست‌ها زیاد شد؛ چند ثانیه صبر کنید.');
    throw new CartError(res.status, json?.error?.code ?? 'error', json?.error?.message ?? 'خطایی رخ داد. دوباره تلاش کنید.', json?.error?.fields);
  }
  return json.data;
}

function broadcast(cart: Cart): Cart {
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('cart:updated', { detail: { item_count: cart.item_count } }));
  return cart;
}

export function analyticsItems(cart: Cart, onlyIds?: number[]): AnalyticsItem[] {
  return cart.items
    .filter((l) => !onlyIds || onlyIds.includes(l.id))
    .map((l) => ({
      item_id: l.product.id,
      item_name: l.product.name,
      item_brand: l.product.brand?.name,
      item_variant: l.variation?.attributes.map((a) => a.value).join(' / ') || undefined,
      price: rialToToman(l.unit_price.amount),
      quantity: l.quantity,
    }));
}

export const cartApi = {
  get: () => call<Cart>('GET', '/api/cart/'),
  update: (body: CartUpdate) => call<Cart>('PATCH', '/api/cart/', body).then(broadcast),
  setQuantity: (id: number, quantity: number) => call<Cart>('PATCH', `/api/cart/items/${id}/`, { quantity }).then(broadcast),
  setInstallation: (id: number, installation: boolean) => call<Cart>('PATCH', `/api/cart/items/${id}/`, { installation }).then(broadcast),
  remove: (id: number) => call<Cart>('DELETE', `/api/cart/items/${id}/`).then(broadcast),
  applyCoupon: (code: string) => call<Cart>('POST', '/api/cart/coupon/', { code }).then(broadcast),
  removeCoupon: () => call<Cart>('DELETE', '/api/cart/coupon/').then(broadcast),
  placeOrder: (idempotencyKey: string) =>
    call<{ order: OrderSummary; payment: PaymentStart | null }>('POST', '/api/checkout/orders/', undefined, { 'Idempotency-Key': idempotencyKey }),
  retryPayment: (number: string, paymentMethod?: string) =>
    call<{ order: OrderSummary; payment: PaymentStart }>('POST', `/api/checkout/orders/${encodeURIComponent(number)}/payments/`, { payment_method: paymentMethod }),
};

/**
 * «افزودن به سبد» for product pages/cards. Returns the cart (item_count etc.)
 * and fires add_to_cart.
 */
export async function addToCart(input: { productId: number; variationId?: number | null; quantity?: number; installation?: boolean; addonIds?: number[] }): Promise<Cart> {
  const cart = await call<Cart>('POST', '/api/cart/items/', {
    product_id: input.productId,
    variation_id: input.variationId ?? null,
    quantity: input.quantity ?? 1,
    installation: input.installation,
    addon_ids: input.addonIds,
  });
  const line = cart.items.find((l) => l.product.id === input.productId && (l.variation?.id ?? null) === (input.variationId ?? null));
  if (line) {
    track('add_to_cart', {
      value: rialToToman(line.unit_price.amount) * (input.quantity ?? 1),
      items: [{ ...analyticsItems(cart, [line.id])[0]!, quantity: input.quantity ?? 1 }],
    });
  }
  return broadcast(cart);
}
