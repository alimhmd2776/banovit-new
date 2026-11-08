import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { CartUnavailable } from '@/features/cart/Unavailable';
import { ShippingView } from '@/features/checkout/ShippingView';
import { loadCart } from '@/lib/cart/server';
import { privatePageMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = privatePageMetadata('تکمیل اطلاعات', '/checkout/');

export default async function CheckoutPage() {
  const cart = await loadCart();
  if (!cart) return <CartUnavailable />;
  if (cart.item_count === 0) redirect('/cart/');
  return <ShippingView initial={cart} />;
}
