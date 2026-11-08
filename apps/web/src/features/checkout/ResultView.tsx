'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { OrderSummary } from '@banovit/api-client';
import { faDigits, rialToToman } from '@banovit/ui';
import { track } from '@/lib/analytics';
import { cartApi, CartError } from '@/features/cart/client';
import { ResultArt } from '@/features/cart/Illustrations';
import { PageHeader } from '@/features/cart/PageHeader';
import { siteConfig } from '@/lib/site-config';

export type ResultKind = 'success' | 'placed' | 'failed';

/** «پرداخت موفق» / «پرداخت ناموفق» / offline order placed. */
export function ResultView({ kind, number, order, refId }: { kind: ResultKind; number: string | null; order: OrderSummary | null; refId: string | null }) {
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (kind === 'failed' || !order) return;
    const key = `bnv_purchase_${order.number}`;
    try {
      if (window.sessionStorage.getItem(key)) return;
      window.sessionStorage.setItem(key, '1');
    } catch {
      /* storage unavailable: may double count on reload */
    }
    track('purchase', { transaction_id: order.number, value: rialToToman(order.total.amount), payment_type: order.payment_method ?? undefined });
  }, [kind, order]);

  async function retry() {
    if (!number) return;
    setRetrying(true);
    setError(null);
    try {
      const r = await cartApi.retryPayment(number);
      if (r.payment.redirect_url) window.location.assign(r.payment.redirect_url);
      else window.location.replace(`/checkout/result/?order=${encodeURIComponent(number)}&status=placed`);
    } catch (e) {
      setRetrying(false);
      setError(e instanceof CartError ? e.message : 'اتصال به درگاه برقرار نشد.');
    }
  }

  const ok = kind !== 'failed';
  const title = kind === 'success' ? 'پرداخت موفق' : kind === 'placed' ? 'سفارش ثبت شد' : 'پرداخت ناموفق';
  const subtitle = number ? [`شماره سفارش ${number}`] : undefined;

  return (
    <>
      <PageHeader title={title} subtitle={subtitle} backHref="/" backLabel="صفحه اصلی" />
      <section className="mx-auto flex min-h-[60dvh] max-w-md flex-col items-center justify-center px-6 py-14 text-center" aria-live="polite">
        <ResultArt kind={ok ? 'success' : 'failed'} />
        <h2 className="mt-6 text-base font-bold text-text">{ok ? 'با تشکر از انتخاب شما' : 'پرداخت سفارش ناموفق بود'}</h2>
        {ok ? (
          <p className="mt-2 text-sm leading-6 text-text-muted">
            {kind === 'success'
              ? 'سفارش شما با موفقیت در بانویت ثبت گردید. همچنین می‌توانید در بخش (سفارشات من) وضعیت سفارش خود را رصد فرمایید.'
              : 'سفارش شما ثبت شد. کارشناس فروش برای هماهنگی پرداخت و ارسال با شما تماس می‌گیرد.'}
            {refId ? <span className="mt-1 block text-xs">کد پیگیری پرداخت: {faDigits(refId)}</span> : null}
          </p>
        ) : (
          <p className="mt-2 text-sm leading-6 text-text-muted">
            ممکن است این مشکل به دلیل اختلال موقت در درگاه پرداخت یا ارتباط با بانک ایجاد شده باشد. اگر مبلغی از حساب شما کسر شده است، نگران نباشید. در صورت ناموفق بودن تراکنش، مبلغ کسرشده طبق روال بانکی به حساب شما بازگردانده می‌شود.
          </p>
        )}
        {error ? (
          <p role="alert" className="mt-3 text-sm text-danger">
            {error}
          </p>
        ) : null}
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          {ok ? (
            <Link href="/my-account/orders/" className="inline-flex h-11 items-center rounded-sm bg-primary px-5 text-sm font-bold text-primary-on hover:bg-primary-hover">
              وضعیت سفارش
            </Link>
          ) : (
            <>
              {number && order ? (
                <button
                  type="button"
                  onClick={retry}
                  disabled={retrying}
                  className="inline-flex h-11 items-center rounded-sm bg-surface-muted px-5 text-sm font-bold text-text hover:bg-border disabled:opacity-60"
                >
                  {retrying ? 'در حال اتصال…' : 'تلاش مجدد'}
                </button>
              ) : null}
              <a
                href={`tel:${siteConfig.supportPhone}`}
                className="inline-flex h-11 items-center rounded-sm border border-border px-5 text-sm font-bold text-text hover:bg-surface-muted"
              >
                تماس با پشتیبانی
              </a>
            </>
          )}
        </div>
      </section>
    </>
  );
}
