import type { Cart } from '@banovit/api-client';
import { faDigits, formatToman } from '@banovit/ui';
import { siteConfig } from '@/lib/site-config';
import { lineDetails } from '@/features/cart/CartLineCard';
import { PrintButton } from './PrintButton';

/** «پیش فاکتور» of the current cart, print-friendly (replaces the WP pre-invoice page). */
export function Proforma({ cart }: { cart: Cart }) {
  const t = cart.totals;
  const today = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { dateStyle: 'long' }).format(new Date());
  const rows: [string, number][] = [
    ['جمع کالاها', t.items.amount],
    ['خدمات نصب', t.installation.amount],
    ['بسته‌بندی ایمن', t.packaging.amount],
    ['هزینه ارسال', t.shipping.amount],
    ['هزینه خدمات', t.service_fee.amount],
    ['کد تخفیف', -t.coupon_discount.amount],
  ];
  return (
    <div className="mx-auto max-w-3xl bg-surface p-6 print:p-0">
      <header className="flex items-start justify-between border-b border-border pb-4">
        <div>
          <p className="text-xl font-extrabold text-primary">{siteConfig.name}</p>
          <p className="mt-1 text-xs text-text-muted">تلفن: {siteConfig.supportPhoneDisplay}</p>
        </div>
        <div className="text-end">
          <h1 className="text-lg font-bold">پیش فاکتور</h1>
          <p className="mt-1 text-xs text-text-muted">تاریخ: {today}</p>
        </div>
      </header>
      <table className="mt-4 w-full text-sm">
        <thead>
          <tr className="border-b border-border text-xs text-text-muted">
            <th className="py-2 text-start font-medium">ردیف</th>
            <th className="py-2 text-start font-medium">کالا</th>
            <th className="py-2 text-center font-medium">تعداد</th>
            <th className="py-2 text-end font-medium">قیمت واحد (تومان)</th>
            <th className="py-2 text-end font-medium">جمع (تومان)</th>
          </tr>
        </thead>
        <tbody>
          {cart.items
            .filter((l) => l.purchasable)
            .map((l, i) => (
              <tr key={l.id} className="border-b border-border align-top">
                <td className="py-2">{faDigits(i + 1)}</td>
                <td className="py-2">
                  {l.product.name}
                  {lineDetails(l).length ? <span className="block text-xs text-text-muted">{lineDetails(l).join('، ')}</span> : null}
                </td>
                <td className="py-2 text-center">{faDigits(l.quantity)}</td>
                <td className="py-2 text-end">{formatToman(l.unit_price.amount)}</td>
                <td className="py-2 text-end">{formatToman(l.line_total.amount)}</td>
              </tr>
            ))}
        </tbody>
      </table>
      <dl className="ms-auto mt-4 w-full max-w-xs space-y-1 text-sm">
        {rows
          .filter(([, v]) => v !== 0)
          .map(([k, v]) => (
            <div key={k} className="flex justify-between">
              <dt className="text-text-muted">{k}</dt>
              <dd>{v < 0 ? `- ${formatToman(-v)}` : formatToman(v)}</dd>
            </div>
          ))}
        <div className="flex justify-between border-t border-border pt-2 text-base font-bold">
          <dt>مبلغ قابل پرداخت</dt>
          <dd>{formatToman(t.payable.amount)} تومان</dd>
        </div>
      </dl>
      <p className="mt-6 text-xs leading-5 text-text-muted">قیمت‌ها تا پایان روز صدور معتبر است و موجودی کالا هنگام ثبت سفارش قطعی می‌شود.</p>
      <PrintButton />
    </div>
  );
}
