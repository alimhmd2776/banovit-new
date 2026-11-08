'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import type { Cart } from '@banovit/api-client';
import { cx, faDigits, IconCheck, IconCreditCard, IconReceipt, IconWallet, rialToToman } from '@banovit/ui';
import { track } from '@/lib/analytics';
import { analyticsItems, cartApi, CartError } from '@/features/cart/client';
import { CheckoutBar, PrimaryAction } from '@/features/cart/CheckoutBar';
import { PageHeader } from '@/features/cart/PageHeader';
import { SummaryCard } from '@/features/cart/SummaryCard';
import { useCart } from '@/features/cart/use-cart';
import { Steps } from './Steps';

const METHOD_ICON: Record<string, React.ReactNode> = {
  zarinpal: <IconWallet size={20} className="text-warning" />,
  card_to_card: <IconCreditCard size={20} className="text-primary" />,
  installments: <IconCreditCard size={20} className="text-primary" />,
};

/** Step 2 «اطلاعات پرداخت»: method, coupon, breakdown, proforma, «پرداخت سفارش». */
export function PaymentView({ initial }: { initial: Cart }) {
  const router = useRouter();
  const { cart, busy, error, run } = useCart(initial);
  const [code, setCode] = useState(initial.coupon?.code ?? '');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState<string | null>(null);
  // One key per checkout attempt: retries of the same tap never create a second order.
  const idem = useRef<string>(typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `k${Date.now()}${Math.random()}`.replace('.', ''));

  const method = cart.options.payment_method;
  const recipient = cart.options.address?.recipient_name;

  async function applyCoupon(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setCouponError(null);
    const c = await run('coupon', () => cartApi.applyCoupon(code.trim()));
    if (!c) setCouponError('کد وارد شده معتبر نیست.');
  }

  async function pay() {
    setPlaceError(null);
    if (!method) {
      setPlaceError('روش پرداخت را انتخاب کنید.');
      return;
    }
    setPlacing(true);
    try {
      const r = await cartApi.placeOrder(idem.current);
      track('add_payment_info', { value: rialToToman(cart.totals.payable.amount), payment_type: method, items: analyticsItems(cart) });
      window.dispatchEvent(new CustomEvent('cart:updated', { detail: { item_count: 0 } }));
      if (r.payment?.redirect_url) {
        window.location.assign(r.payment.redirect_url);
        return;
      }
      router.replace(`/checkout/result/?order=${encodeURIComponent(r.order.number)}&status=${r.payment?.status === 'offline' ? 'placed' : 'pending'}`);
    } catch (e) {
      setPlacing(false);
      const err = e instanceof CartError ? e : null;
      if (err?.code === 'address_required' || err?.code === 'delivery_date_required') {
        router.push('/checkout/');
        return;
      }
      setPlaceError(err?.message ?? 'ثبت سفارش انجام نشد. دوباره تلاش کنید.');
      // A new attempt after a real failure gets a fresh key.
      idem.current = `${idem.current.split('~')[0]}~${Date.now()}`;
    }
  }

  return (
    <>
      <PageHeader title="اطلاعات پرداخت" subtitle={recipient ? [recipient] : undefined} backHref="/checkout/" backLabel="بازگشت به اطلاعات ارسال" />
      <Steps current={2} />
      <div className="mx-auto max-w-container px-4 pb-40 pt-5 lg:grid lg:grid-cols-12 lg:gap-8 lg:pb-16 lg:pt-4">
        <div className="space-y-6 lg:col-span-8">
          <section aria-labelledby="pay-method">
            <h2 id="pay-method" className="flex items-center gap-1.5 text-sm">
              <span className="font-bold text-text">روش پرداخت</span>
              <span className="text-primary">*</span>
            </h2>
            <div role="radiogroup" aria-labelledby="pay-method" className="mt-3 space-y-1 rounded-lg border border-border bg-surface p-2">
              {cart.payment_methods.map((m) => {
                const on = m.key === method;
                return (
                  <button
                    key={m.key}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    disabled={!m.available || busy !== null}
                    onClick={() => void run('method', () => cartApi.update({ payment_method: m.key }))}
                    className={cx(
                      'flex min-h-14 w-full items-center gap-3 rounded-md px-3 text-start text-sm transition-colors disabled:cursor-not-allowed',
                      on ? 'bg-primary-subtle font-bold text-primary-on-subtle' : 'text-text hover:bg-surface-muted',
                      !m.available && 'opacity-50',
                    )}
                  >
                    {METHOD_ICON[m.key]}
                    <span className="flex-1">
                      <span className="block font-bold">{m.label}</span>
                      {m.description && (on || !m.available) ? <span className="mt-0.5 block text-xs font-normal text-text-muted">{m.description}</span> : null}
                    </span>
                    {on ? <IconCheck size={20} className="text-primary" /> : null}
                  </button>
                );
              })}
            </div>
          </section>

          <section aria-labelledby="coupon-title">
            <div className="flex items-center gap-2 text-sm">
              <h2 id="coupon-title" className="font-bold text-text">
                کد تخفیف
              </h2>
              {cart.coupon ? <span className="text-xs text-primary">{cart.coupon.label} اعمال شده</span> : null}
            </div>
            <form onSubmit={applyCoupon} className="mt-3 flex gap-2">
              <label htmlFor="coupon" className="sr-only">
                کد تخفیف
              </label>
              <input
                id="coupon"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                readOnly={!!cart.coupon}
                dir="ltr"
                autoCapitalize="characters"
                placeholder="کد تخفیف را وارد کنید"
                className="h-12 min-w-0 flex-1 rounded-md border-0 bg-surface-muted px-4 text-end text-sm font-bold uppercase text-text placeholder:text-start placeholder:font-normal placeholder:normal-case placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-primary/30"
                aria-invalid={!!couponError}
                aria-describedby={couponError ? 'coupon-err' : undefined}
              />
              {cart.coupon ? (
                <button
                  type="button"
                  onClick={() => void run('coupon', () => cartApi.removeCoupon()).then(() => setCode(''))}
                  className="h-12 shrink-0 rounded-md border border-border px-5 text-sm font-bold text-text hover:bg-surface-muted"
                >
                  حذف کد
                </button>
              ) : (
                <button type="submit" disabled={busy === 'coupon'} className="h-12 shrink-0 rounded-md bg-primary px-5 text-sm font-bold text-primary-on hover:bg-primary-hover disabled:opacity-60">
                  اعمال تخفیف
                </button>
              )}
            </form>
            {couponError || (busy === null && error && error.code.startsWith('coupon')) ? (
              <p id="coupon-err" role="alert" className="mt-2 text-xs text-danger">
                {error?.code.startsWith('coupon') ? error.message : couponError}
              </p>
            ) : null}
          </section>

          <div className="lg:hidden">
            <SummaryCard cart={cart} compact>
              <ProformaLink />
            </SummaryCard>
          </div>
          {placeError ? (
            <p role="alert" className="rounded-sm bg-danger-subtle px-3 py-2 text-sm text-danger-on-subtle">
              {placeError}
            </p>
          ) : null}
        </div>
        <aside className="hidden lg:col-span-4 lg:block">
          <div className="sticky top-[calc(var(--header-height)+56px)]">
            <SummaryCard cart={cart}>
              <PrimaryAction label="پرداخت سفارش" onClick={pay} loading={placing} disabled={!cart.ready_for_checkout || !method} className="h-12 w-full" />
              <ProformaLink />
            </SummaryCard>
          </div>
        </aside>
      </div>
      <CheckoutBar totals={cart.totals} label="پرداخت سفارش" onClick={pay} loading={placing} disabled={!cart.ready_for_checkout || !method} />
      <span className="sr-only" aria-live="polite">
        {busy ? 'در حال به‌روزرسانی…' : `مبلغ قابل پرداخت ${faDigits(rialToToman(cart.totals.payable.amount))} تومان`}
      </span>
    </>
  );
}

function ProformaLink() {
  return (
    <a
      href="/cart/proforma/"
      target="_blank"
      rel="noopener"
      className="flex h-12 w-full items-center justify-center gap-2 rounded-md border border-border bg-surface text-sm font-bold text-text hover:bg-surface-muted"
    >
      <IconReceipt size={20} />
      دریافت پیش فاکتور
    </a>
  );
}
