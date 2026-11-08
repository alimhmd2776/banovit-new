import type { Cart } from '@banovit/api-client';
import { faDigits, IconInfo } from '@banovit/ui';
import type { ReactNode } from 'react';
import { Money } from './Money';

/**
 * «جزئیات پرداخت»: the price breakdown. Used as the desktop sidebar on every
 * step and inline on the mobile payment step. Rows with 0 are hidden, except
 * shipping (shows «رایگان»/«پس‌کرایه»).
 */
export function SummaryCard({
  cart,
  children,
  title = 'جزئیات پرداخت',
  compact = false,
  itemsOnly = false,
}: {
  cart: Cart;
  children?: ReactNode;
  title?: string;
  compact?: boolean;
  /** Cart step: products (+ chosen installation) only; delivery is priced on the next step. */
  itemsOnly?: boolean;
}) {
  const t = cart.totals;
  if (itemsOnly) {
    return (
      <section aria-label="خلاصه سبد" className="rounded-lg border border-border bg-surface p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-text">خلاصه سبد</h2>
          <span className="text-xs font-bold text-primary">{faDigits(cart.item_count)} عدد کالا</span>
        </div>
        <dl className="divide-y divide-border text-sm">
          <Row label="قیمت کالاها">
            <Money rial={t.items_regular.amount} unitClassName="text-text-muted" />
          </Row>
          {t.product_discount.amount > 0 ? (
            <Row label="تخفیف محصولات">
              <Money rial={t.product_discount.amount} className="text-danger" unitClassName="text-danger" />
            </Row>
          ) : null}
          {t.installation.amount > 0 ? (
            <Row label="خدمات نصب">
              <Money rial={t.installation.amount} unitClassName="text-text-muted" />
            </Row>
          ) : null}
          <Row label="جمع سبد خرید" strong>
            <Money rial={t.items.amount + t.installation.amount} className="font-extrabold" />
          </Row>
        </dl>
        <p className="mt-2 text-xs leading-5 text-text-muted">هزینه ارسال و خدمات در مرحله بعد بر اساس آدرس محاسبه می‌شود.</p>
        {children ? <div className="mt-4 space-y-3">{children}</div> : null}
      </section>
    );
  }
  const rows: [string, number, string?][] = [
    ['مجموع خرید', t.items_regular.amount],
    ['هزینه خدمات', t.service_fee.amount],
    ['هزینه نصب درب محل', t.installation.amount],
    ['هزینه بسته‌بندی ایمن', t.packaging.amount],
  ];
  return (
    <section aria-label={title} className="rounded-lg border border-border bg-surface-muted/60 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold text-text">{title}</h2>
        <span className="text-xs font-bold text-primary">{faDigits(cart.item_count)} عدد کالا</span>
      </div>
      <dl className="divide-y divide-border text-sm">
        {rows
          .filter(([, v]) => v > 0)
          .map(([k, v]) => (
            <Row key={k} label={k}>
              <Money rial={v} unitClassName="text-text-muted" />
            </Row>
          ))}
        <Row label={cart.delivery.method ? `هزینه ارسال (${cart.delivery.method.title})` : 'هزینه ارسال'}>
          {t.shipping.amount > 0 ? (
            <Money rial={t.shipping.amount} unitClassName="text-text-muted" />
          ) : (
            <span className="text-text-muted">{cart.delivery.fee_label ?? 'رایگان'}</span>
          )}
        </Row>
        {t.product_discount.amount > 0 ? (
          <Row label="تخفیف محصولات">
            <Money rial={t.product_discount.amount} className="text-danger" unitClassName="text-danger" />
          </Row>
        ) : null}
        {t.coupon_discount.amount > 0 ? (
          <Row label={`کد تخفیف ${cart.coupon?.code ?? ''}`}>
            <Money rial={t.coupon_discount.amount} className="text-danger" unitClassName="text-danger" />
          </Row>
        ) : null}
        {!compact ? (
          <Row label="مبلغ قابل پرداخت" strong>
            <Money rial={t.payable.amount} className="font-extrabold" />
          </Row>
        ) : null}
      </dl>
      {t.savings.amount > 0 ? (
        <p className="mt-3 flex items-center gap-2 rounded-full border border-primary/20 bg-primary-subtle px-3 py-2 text-xs font-medium text-primary-on-subtle">
          <IconInfo size={16} className="shrink-0" />
          در این سفارش <Money rial={t.savings.amount} className="font-bold" /> سود می‌کنید!
        </p>
      ) : null}
      {children ? <div className="mt-4 space-y-3">{children}</div> : null}
    </section>
  );
}

function Row({ label, children, strong }: { label: string; children: ReactNode; strong?: boolean }) {
  return (
    <div className={strong ? 'flex items-center justify-between py-3 text-base text-text' : 'flex items-center justify-between py-2.5 text-text'}>
      <dt className={strong ? 'font-bold' : 'text-text-muted'}>{label}</dt>
      <dd className="font-medium">{children}</dd>
    </div>
  );
}
