import type { Metadata } from 'next';
import type { OrderSummary } from '@banovit/api-client';
import { ResultView, type ResultKind } from '@/features/checkout/ResultView';
import { cartClient, cartSession, orderTokenFor } from '@/lib/cart/server';
import { privatePageMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = privatePageMetadata('نتیجه سفارش', '/checkout/result/');

type Props = { searchParams: Promise<{ order?: string; status?: string; ref?: string }> };

/** The query string only says which order; paid/unpaid comes from the CMS. */
export default async function ResultPage({ searchParams }: Props) {
  const sp = await searchParams;
  const number = sp.order && /^[\w-]{1,40}$/.test(sp.order) ? sp.order : null;
  let order: OrderSummary | null = null;
  if (number) {
    try {
      order = await cartClient.getOrder(await cartSession({ orderToken: await orderTokenFor(number) }), number);
    } catch {
      order = null;
    }
  }
  let kind: ResultKind = 'failed';
  if (order?.is_paid) kind = 'success';
  else if (order && ['on-hold', 'processing'].includes(order.status)) kind = 'placed';
  else if (!order && sp.status === 'success') kind = 'success'; // order not readable (other device): trust the gateway result
  return <ResultView kind={kind} number={number} order={order} refId={sp.ref ?? null} />;
}
