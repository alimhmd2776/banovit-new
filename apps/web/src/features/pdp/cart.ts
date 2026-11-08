/**
 * Add to cart through the cart BFF (contract agreed with the cart thread,
 * branch feature/web-cart): POST /api/cart/items/ -> 201 {data: Cart} or
 * {error:{code,message}}. After both branches merge this can delegate to
 * `addToCart` from '@/features/cart/client'.
 */
export type AddToCartInput = {
  product_id: number;
  variation_id: number | null;
  quantity: number;
  addon_ids: number[];
  installation: boolean;
};

export class CartError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

const MESSAGES: Record<string, string> = {
  out_of_stock: 'موجودی این کالا تمام شده است.',
  variation_required: 'لطفاً گزینه‌های محصول را انتخاب کنید.',
  no_price: 'قیمت این کالا مشخص نیست؛ برای خرید تماس بگیرید.',
  cart_full: 'سبد خرید شما پر است.',
};

export async function addToCart(input: AddToCartInput): Promise<{ item_count?: number }> {
  let res: Response;
  try {
    res = await fetch('/api/cart/items/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(input),
    });
  } catch {
    throw new CartError('network', 'ارتباط برقرار نشد. دوباره تلاش کنید.');
  }
  const body = (await res.json().catch(() => null)) as { data?: { item_count?: number }; error?: { code?: string; message?: string } } | null;
  if (!res.ok) {
    const code = body?.error?.code ?? `http_${res.status}`;
    throw new CartError(code, body?.error?.message ?? MESSAGES[code] ?? 'افزودن به سبد انجام نشد. دوباره تلاش کنید.');
  }
  const cart = body?.data ?? {};
  window.dispatchEvent(new CustomEvent('cart:updated', { detail: { item_count: cart.item_count } }));
  return cart;
}
