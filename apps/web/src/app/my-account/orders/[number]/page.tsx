import Image from 'next/image';
import Link from 'next/link';
import type { OrderDetail } from '@banovit/api-client';
import { cx, faDigits, formatToman } from '@banovit/ui';
import { AppBar } from '@/features/account/AppBar';
import { jalaliLong, phoneDisplay } from '@/features/account/format';
import { IconBag, IconHeadset, IconPalette, IconPin, IconShield, IconTruck, IconUser as IconPerson } from '@/features/account/orderIcons';
import { OrderSteps } from '@/features/account/OrderSteps';
import { RateProduct } from '@/features/account/RateProduct';
import { accountGet } from '@/lib/account/api';
import { requireCustomer } from '@/lib/auth/session';

type Params = Promise<{ number: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { number } = await params;
  return { title: `سفارش ${decodeURIComponent(number)}` };
}

/** «جزئیات سفارش» (designs/account/09-order-detail) + shipment tracking and totals. */
export default async function OrderDetailPage({ params }: { params: Params }) {
  const number = decodeURIComponent((await params).number);
  const self = `/my-account/orders/${encodeURIComponent(number)}/`;
  await requireCustomer(self);
  const { data: o } = await accountGet<{ data: OrderDetail }>(`/orders/${encodeURIComponent(number)}`, self);
  const badge = o.tab === 'current' ? 'سفارش جاری' : o.tab === 'delivered' ? 'تحویل شده' : o.status_label;

  return (
    <>
      <AppBar
        title="جزئیات سفارش"
        backHref="/my-account/orders/"
        actions={
          <Link href={`${self}invoice/`} className="inline-flex h-11 items-center rounded-md border border-border bg-surface px-4 text-sm font-bold text-text hover:bg-surface-muted">
            دریافت فاکتور
          </Link>
        }
      />

      <section className="mt-4 rounded-md bg-surface">
        <div className="flex items-center gap-3">
          <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-md bg-primary-subtle text-primary">
            <IconBag size={24} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-extrabold text-text">سفارش {faDigits(o.number)}</h2>
            <p className="mt-0.5 text-xs text-text-muted">
              {o.delivery_date ? `تاریخ تحویل بسته: ${jalaliLong(o.delivery_date)}` : `تاریخ ثبت: ${jalaliLong(o.ordered_at)}`}
            </p>
          </div>
          <span className={cx('rounded-full px-3 py-1 text-xs', o.tab === 'cancelled' ? 'bg-danger-subtle text-danger-on-subtle' : 'bg-primary-subtle text-primary-on-subtle')}>{badge}</span>
        </div>
        {o.steps.length ? (
          <div className="mt-4">
            <OrderSteps steps={o.steps} size="md" />
          </div>
        ) : null}
      </section>

      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid content-start gap-4">
          <section aria-labelledby="recipient" className="overflow-hidden rounded-md border border-border">
            <h2 id="recipient" className="flex items-center gap-2 bg-surface-muted px-3 py-2.5 text-sm text-text-muted">
              <IconPerson size={16} /> اطلاعات تحویل گیرنده
            </h2>
            <dl className="grid gap-3 p-3 text-sm">
              <Row label="کد پیگیری سفارش" value={<span dir="ltr">{o.number}</span>} />
              <Row label="تاریخ ثبت سفارش" value={jalaliLong(o.ordered_at)} />
              <Row label="تحویل گیرنده" value={o.recipient.name} />
              <Row label="شماره موبایل" value={<span dir="ltr">{phoneDisplay(o.recipient.phone)}</span>} />
              {o.payment_method ? <Row label="روش پرداخت" value={o.payment_method} /> : null}
            </dl>
            {o.recipient.address ? (
              <p className="mx-3 mb-3 flex items-center gap-1.5 rounded-sm border border-border px-2.5 py-2 text-xs text-text-muted">
                <IconPin size={14} className="shrink-0" /> {o.recipient.address}
              </p>
            ) : null}
          </section>

          {o.shipments.length ? (
            <section aria-labelledby="shipments" className="rounded-md border border-border p-3">
              <h2 id="shipments" className="flex items-center gap-2 text-sm font-bold text-text">
                <IconTruck size={18} /> پیگیری مرسوله
              </h2>
              <ul className="mt-2 grid gap-2 text-sm">
                {o.shipments.map((s, i) => (
                  <li key={i} className="rounded-sm bg-surface-muted p-2.5">
                    <p className="font-bold">{s.method_label}{s.shipped_at ? ` · ارسال ${jalaliLong(s.shipped_at)}` : ' · در انتظار ارسال'}</p>
                    {s.tracking_number ? <p className="mt-1 text-xs text-text-muted">کد رهگیری: <span dir="ltr" className="font-bold text-text">{s.tracking_number}</span></p> : null}
                    {s.carrier_name ? <p className="mt-1 text-xs text-text-muted">{s.carrier_name}{s.carrier_phone ? ` · ${phoneDisplay(s.carrier_phone)}` : ''}</p> : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section aria-label="کالاهای سفارش" className="grid gap-4">
            {o.items.map((it) => {
              const color = it.attributes.find((a) => a.name.includes('رنگ'));
              const img = it.product?.image;
              const name = it.product?.path ? <Link href={it.product.path} className="hover:text-primary">{it.name}</Link> : it.name;
              return (
                <article key={it.id} className="rounded-md border border-border p-3">
                  <div className="flex gap-3">
                    <div className="relative size-24 shrink-0 overflow-hidden rounded-sm bg-surface-muted">
                      {img ? <Image src={img.url} alt={img.alt ?? it.name} fill sizes="96px" className="object-cover" /> : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="inline-block rounded-xs bg-surface-muted px-2 text-xs leading-5 text-text-muted">{faDigits(it.quantity)} عدد</span>
                      <h3 className="mt-1 font-extrabold text-text">{name}</h3>
                      <ul className="mt-2 grid gap-1 text-xs text-text-muted">
                        {color ? <li className="flex items-center gap-1.5"><IconPalette size={14} /> رنگ {color.value}</li> : null}
                        {it.attributes.filter((a) => a !== color).map((a) => <li key={a.name}>{a.name}: {a.value}</li>)}
                        <li className="flex items-center gap-1.5"><IconShield size={14} /> ۷ روز ضمانت بازگشت محصول</li>
                      </ul>
                      <p className="mt-2 font-extrabold text-primary">{formatToman(it.total.amount)} <span className="text-xs">تومان</span></p>
                      {it.cancelled_quantity ? <p className="mt-1 text-xs text-danger">{faDigits(it.cancelled_quantity)} عدد لغو شد</p> : null}
                    </div>
                  </div>
                  {o.can_rate && it.product?.slug ? <RateProduct slug={it.product.slug} name={it.name} /> : null}
                </article>
              );
            })}
          </section>
        </div>

        <aside className="grid content-start gap-4">
          <section aria-labelledby="totals" className="rounded-md border border-border p-3 text-sm">
            <h2 id="totals" className="font-bold text-text">صورتحساب</h2>
            <dl className="mt-2 grid gap-2">
              <Money label="جمع کالاها" rial={o.totals.subtotal.amount} />
              {o.totals.discount.amount ? <Money label="تخفیف" rial={-o.totals.discount.amount} /> : null}
              <Money label="هزینه ارسال" rial={o.totals.shipping.amount} zero="رایگان" />
              {o.totals.tax.amount ? <Money label="مالیات" rial={o.totals.tax.amount} /> : null}
              <div className="my-1 border-t border-border" />
              <Money label="مبلغ کل" rial={o.totals.total.amount} strong />
              <Money label="پرداخت شده" rial={o.totals.paid.amount} />
              {o.totals.balance_due.amount > 0 && o.tab !== 'cancelled' ? <Money label="مانده" rial={o.totals.balance_due.amount} strong /> : null}
            </dl>
            {o.refund ? (
              <p className="mt-3 rounded-sm bg-surface-muted p-2 text-xs text-text-muted">
                درخواست عودت وجه {formatToman(o.refund.amount.amount)} تومان: {o.refund.status === 'approved' ? 'واریز شد' : o.refund.status === 'rejected' ? 'رد شد' : 'در حال بررسی'}
              </p>
            ) : null}
          </section>
          <Link href={`/my-account/support/new/?topic=orders&order=${encodeURIComponent(o.number)}`} className="flex items-center gap-2 rounded-md border border-border p-3 text-sm font-bold text-text hover:bg-surface-muted">
            <IconHeadset size={20} /> مشکلی در این سفارش دارید؟ ثبت گزارش
          </Link>
        </aside>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-text-muted">{label}</dt>
      <dd className="font-bold text-text">{value || '—'}</dd>
    </div>
  );
}

function Money({ label, rial, strong, zero }: { label: string; rial: number; strong?: boolean; zero?: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-text-muted">{label}</dt>
      <dd className={strong ? 'font-extrabold text-text' : 'text-text'}>
        {rial === 0 && zero ? zero : <>{rial < 0 ? '−' : ''}{formatToman(Math.abs(rial))} <span className="text-xs">تومان</span></>}
      </dd>
    </div>
  );
}
