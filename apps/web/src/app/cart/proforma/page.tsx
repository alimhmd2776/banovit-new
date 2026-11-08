import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Proforma } from '@/features/checkout/Proforma';
import { loadCart } from '@/lib/cart/server';
import { privatePageMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = privatePageMetadata('پیش فاکتور', '/cart/proforma/');

export default async function ProformaPage() {
  const cart = await loadCart();
  if (!cart || cart.item_count === 0) redirect('/cart/');
  return <Proforma cart={cart} />;
}
