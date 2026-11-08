import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { CartUnavailable } from '@/features/cart/Unavailable';
import { PaymentView } from '@/features/checkout/PaymentView';
import { loadCart } from '@/lib/cart/server';
import { privatePageMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = privatePageMetadata('اطلاعات پرداخت', '/checkout/payment/');

export default async function PaymentPage() {
  const cart = await loadCart();
  if (!cart) return <CartUnavailable />;
  if (cart.item_count === 0) redirect('/cart/');
  if (!cart.options.address || (cart.delivery.requires_slot && !cart.options.delivery_date)) redirect('/checkout/');
  return <PaymentView initial={cart} />;
}
