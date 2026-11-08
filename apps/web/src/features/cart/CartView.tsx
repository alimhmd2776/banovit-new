'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import type { Cart } from '@banovit/api-client';
import { faDigits, IconHeart, rialToToman } from '@banovit/ui';
import { track } from '@/lib/analytics';
import { analyticsItems, cartApi } from './client';
import { CartLineCard } from './CartLineCard';
import { CheckoutBar, PrimaryAction } from './CheckoutBar';
import { EmptyBasketArt } from './Illustrations';
import { PageHeader } from './PageHeader';
import { SummaryCard } from './SummaryCard';
import { useCart } from './use-cart';

/** «سبدخرید من»: lines, quantities, installation per line, then «تکمیل سفارش». */
export function CartView({ initial }: { initial: Cart }) {
  const { cart, busy, error, run } = useCart(initial);

  useEffect(() => {
    if (initial.item_count > 0) track('view_cart', { value: rialToToman(initial.totals.payable.amount), items: analyticsItems(initial) });
  }, [initial]);

  const subtitle = [`ارسال به ${cart.delivery.zone.label}`, cart.item_count ? `${faDigits(cart.item_count)} عدد محصول` : 'بدون محصول'];
  const wishlist = (
    <Link
      href="/my-account/wishlist/"
      aria-label="علاقه‌مندی‌ها"
      className="inline-flex size-11 shrink-0 items-center justify-center rounded-md border border-border text-text hover:bg-surface-muted"
    >
      <IconHeart size={20} />
    </Link>
  );

  if (cart.items.length === 0) {
    return (
      <>
        <PageHeader title="سبدخرید من" subtitle={subtitle} action={wishlist} />
        <section className="mx-auto flex min-h-[60dvh] max-w-md flex-col items-center justify-center px-6 py-16 text-center">
          <EmptyBasketArt />
          <h2 className="mt-6 text-base font-bold text-text">سبد خرید شما خالیست!</h2>
          <p className="mt-2 text-sm leading-6 text-text-muted">می‌توانید در فروشگاه بانویت محصول موردنظر خود را در سبد اضافه کنید.</p>
          <Link href="/shop/" className="mt-5 inline-flex h-11 items-center rounded-sm bg-primary px-5 text-sm font-bold text-primary-on hover:bg-primary-hover">
            فروشگاه بانویت
          </Link>
        </section>
      </>
    );
  }

  const removeLine = (id: number) => {
    const line = cart.items.find((l) => l.id === id);
    void run(`remove:${id}`, () => cartApi.remove(id)).then((c) => {
      if (c && line) track('remove_from_cart', { value: rialToToman(line.line_total.amount), items: analyticsItems(cart, [id]) });
    });
  };

  return (
    <>
      <PageHeader title="سبدخرید من" subtitle={subtitle} action={wishlist} />
      <div className="mx-auto max-w-container px-4 pb-48 pt-4 lg:grid lg:grid-cols-12 lg:gap-8 lg:pb-16 lg:pt-8">
        <section aria-labelledby="cart-lines" className="lg:col-span-8">
          <h2 id="cart-lines" className="text-sm font-bold text-text">
            لیست محصولات
          </h2>
          {error ? (
            <p role="alert" className="mt-3 rounded-sm bg-danger-subtle px-3 py-2 text-sm text-danger-on-subtle">
              {error.message}
            </p>
          ) : null}
          <div className="divide-y divide-border lg:mt-2 lg:rounded-lg lg:border lg:border-border lg:bg-surface lg:px-5">
            {cart.items.map((line) => (
              <CartLineCard
                key={line.id}
                line={line}
                busy={busy !== null && busy.endsWith(`:${line.id}`)}
                onQuantity={(q) => void run(`qty:${line.id}`, () => cartApi.setQuantity(line.id, q))}
                onRemove={() => removeLine(line.id)}
                onInstallation={(on) => void run(`install:${line.id}`, () => cartApi.setInstallation(line.id, on))}
              />
            ))}
          </div>
        </section>

        <aside className="hidden lg:col-span-4 lg:block">
          <div className="sticky top-[calc(var(--header-height)+56px)]">
            <SummaryCard cart={cart} itemsOnly>
              <PrimaryAction label="تکمیل سفارش" href="/checkout/" disabled={!cart.ready_for_checkout} className="h-12 w-full" />
            </SummaryCard>
          </div>
        </aside>
      </div>
      <CheckoutBar totals={cart.totals} label="تکمیل سفارش" href="/checkout/" disabled={!cart.ready_for_checkout} aboveNav itemsOnly />
    </>
  );
}
