'use client';

import Link from 'next/link';
import type { CartTotals } from '@banovit/api-client';
import { cx, faDigits, formatToman } from '@banovit/ui';
import { Money } from './Money';

/**
 * Mobile sticky action bar («تکمیل سفارش» / «اطلاعات پرداخت» / «پرداخت سفارش»):
 * primary button on the start side, struck price + total on the end side.
 * `aboveNav` lifts it over the bottom navigation (cart page); checkout pages
 * hide the bottom nav. Hidden from lg, where the summary card has the button.
 */
export function CheckoutBar({
  totals,
  label,
  href,
  onClick,
  disabled,
  loading,
  aboveNav = false,
  showRegular = true,
  itemsOnly = false,
}: {
  totals: CartTotals;
  label: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  aboveNav?: boolean;
  showRegular?: boolean;
  /** Cart step: products only (delivery/add-ons are chosen on the next step). */
  itemsOnly?: boolean;
}) {
  return (
    <div
      className={cx(
        'fixed inset-x-0 z-sticky px-4 pb-3 lg:hidden',
        aboveNav ? 'bottom-[calc(var(--bottom-nav-height)+env(safe-area-inset-bottom))]' : 'bottom-0 pb-[max(12px,env(safe-area-inset-bottom))]',
      )}
    >
      <div className="mx-auto flex max-w-xl items-center justify-between gap-3 rounded-lg border border-border bg-surface p-3 shadow-lg">
        <PrimaryAction label={label} href={href} onClick={onClick} disabled={disabled} loading={loading} className="h-12 px-6" />
        <TotalBlock totals={totals} showRegular={showRegular} itemsOnly={itemsOnly} />
      </div>
    </div>
  );
}

export function TotalBlock({ totals, showRegular = true, itemsOnly = false }: { totals: CartTotals; showRegular?: boolean; itemsOnly?: boolean }) {
  const saving = itemsOnly ? totals.product_discount.amount : totals.savings.amount;
  const total = itemsOnly ? totals.items.amount + totals.installation.amount : totals.payable.amount;
  const regular = total + saving;
  const pct = regular > 0 ? Math.floor((saving * 100) / regular) : 0;
  return (
    <div className="flex flex-col items-end" aria-live="polite">
      {showRegular && saving > 0 ? (
        <div className="flex items-center gap-1.5">
          <del className="text-xs text-text-subtle" aria-label="مبلغ بدون تخفیف">
            {formatToman(regular)}
          </del>
          {pct > 0 ? <span className="rounded-full bg-danger px-1.5 text-[11px] font-bold leading-5 text-primary-on">٪{faDigits(pct)}</span> : null}
        </div>
      ) : null}
      <Money rial={total} className="text-base font-extrabold text-text" />
    </div>
  );
}

export function PrimaryAction({
  label,
  href,
  onClick,
  disabled,
  loading,
  className,
}: {
  label: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}) {
  const cls = cx(
    'inline-flex items-center justify-center gap-2 rounded-full bg-primary text-sm font-bold text-primary-on transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
    (disabled || loading) && 'pointer-events-none opacity-50',
    className,
  );
  const content = (
    <>
      {loading ? <span className="size-4 animate-spin rounded-full border-2 border-primary-on border-t-transparent" aria-hidden="true" /> : null}
      {label}
    </>
  );
  if (href && !disabled) {
    return (
      <Link href={href} className={cls}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} disabled={disabled || loading} aria-busy={loading} className={cls}>
      {content}
    </button>
  );
}
