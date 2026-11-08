import type { AccountOrderDetail } from '@banovit/api-client';
import { faDigits, formatToman } from '@banovit/ui';
import { AppBar } from '@/features/account/AppBar';
import { jalaliLong, phoneDisplay } from '@/features/account/format';
import { PrintButton } from '@/features/account/PrintButton';
import { accountGet } from '@/lib/account/api';
import { requireCustomer } from '@/lib/auth/session';

export const metadata = { title: 'فاکتور سفارش' };

/**
 * «دریافت فاکتور»: printable invoice (replaces woocommerce-invoice-pro's PDF;
 * the browser's «Save as PDF» gives the file). Official (رسمی) invoices still
 * come from Sepidar through sales.
 */
export default async function InvoicePage({ params }: { params: Promise<{ number: string }> }) {
  const number = decodeURIComponent((await params).number);
  const self = `/my-account/orders/${encodeURIComponent(number)}/invoice/`;
  const customer = await requireCustomer(self);
  const { data: o } = await accountGet<{ data: AccountOrderDetail }>(`/orders/${encodeURIComponent(number)}`, self);

  return (
    <>
      <div className="print:hidden">
        <AppBar title="فاکتور سفارش" backHref={`/my-account/orders/${encodeURIComponent(number)}/`} actions={<PrintButton />} />
      </div>
      <article className="mt-4 rounded-md border border-border bg-surface p-4 text-sm print:mt-0 print:border-none print:p-0">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-4">
          <div>
            <p className="text-xl font-extrabold text-primary">بانویت</p>
            <p className="mt-1 text-xs text-text-muted">فروشگاه اینترنتی لوازم بهداشتی و آشپزخانه · banovit.com</p>
          </div>
          <dl className="grid grid-cols-[auto_auto] gap-x-3 gap-y-1 text-xs">
            <dt className="text-text-muted">شماره سفارش</dt><dd className="font-bold" dir="ltr">{o.number}</dd>
            <dt className="text-text-muted">تاریخ</dt><dd className="font-bold">{jalaliLong(o.ordered_at)}</dd>
            <dt className="text-text-muted">وضعیت</dt><dd className="font-bold">{o.status_label}</dd>
          </dl>
        </header>
        <section className="grid gap-1 border-b border-border py-4 text-xs">
          <p><span className="text-text-muted">خریدار: </span><b>{o.recipient.name || customer.name}</b> · <span dir="ltr">{phoneDisplay(o.recipient.phone || customer.phone)}</span></p>
          {o.recipient.address ? <p><span className="text-text-muted">نشانی: </span>{o.recipient.address}{o.recipient.postal_code ? ` · کد پستی ${faDigits(o.recipient.postal_code)}` : ''}</p> : null}
        </section>
        <div className="overflow-x-auto">
          <table className="mt-4 w-full min-w-[520px] border-collapse text-xs">
            <thead>
              <tr className="bg-surface-muted text-text-muted">
                <th className="p-2 text-start font-normal">#</th>
                <th className="p-2 text-start font-normal">کالا</th>
                <th className="p-2 text-center font-normal">تعداد</th>
                <th className="p-2 text-end font-normal">قیمت واحد (تومان)</th>
                <th className="p-2 text-end font-normal">جمع (تومان)</th>
              </tr>
            </thead>
            <tbody>
              {o.items.map((it, i) => (
                <tr key={it.id} className="border-b border-border">
                  <td className="p-2">{faDigits(i + 1)}</td>
                  <td className="p-2">
                    {it.name}
                    {it.attributes.length ? <span className="block text-text-muted">{it.attributes.map((a) => `${a.name}: ${a.value}`).join('، ')}</span> : null}
                  </td>
                  <td className="p-2 text-center">{faDigits(it.quantity)}</td>
                  <td className="p-2 text-end">{formatToman(it.unit_price.amount)}</td>
                  <td className="p-2 text-end font-bold">{formatToman(it.total.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <dl className="ms-auto mt-4 grid max-w-xs grid-cols-[1fr_auto] gap-y-1 text-xs">
          <dt className="text-text-muted">جمع کالاها</dt><dd>{formatToman(o.totals.subtotal.amount)}</dd>
          {o.totals.discount.amount ? <><dt className="text-text-muted">تخفیف</dt><dd>−{formatToman(o.totals.discount.amount)}</dd></> : null}
          <dt className="text-text-muted">هزینه ارسال</dt><dd>{formatToman(o.totals.shipping.amount)}</dd>
          {o.totals.tax.amount ? <><dt className="text-text-muted">مالیات بر ارزش افزوده</dt><dd>{formatToman(o.totals.tax.amount)}</dd></> : null}
          <dt className="font-bold">مبلغ کل (تومان)</dt><dd className="font-extrabold">{formatToman(o.totals.total.amount)}</dd>
          <dt className="text-text-muted">پرداخت شده</dt><dd>{formatToman(o.totals.paid.amount)}</dd>
        </dl>
        <p className="mt-6 text-[11px] text-text-subtle">این فاکتور غیررسمی است. برای فاکتور رسمی با پشتیبانی تماس بگیرید.</p>
      </article>
    </>
  );
}
