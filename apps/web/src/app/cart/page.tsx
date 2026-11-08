import type { Metadata } from 'next';
import { CartUnavailable } from '@/features/cart/Unavailable';
import { CartView } from '@/features/cart/CartView';
import { loadCart } from '@/lib/cart/server';
import { privatePageMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = privatePageMetadata('سبد خرید', '/cart/');

export default async function CartPage() {
  const cart = await loadCart();
  return cart ? <CartView initial={cart} /> : <CartUnavailable />;
}
