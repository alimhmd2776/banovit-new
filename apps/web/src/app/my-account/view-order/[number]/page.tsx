import { permanentRedirect } from 'next/navigation';

/** WooCommerce URL /my-account/view-order/{id}/ → /my-account/orders/{number}/ */
export default async function LegacyViewOrder({ params }: { params: Promise<{ number: string }> }) {
  permanentRedirect(`/my-account/orders/${(await params).number}/`);
}
