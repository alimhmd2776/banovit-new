import Image from 'next/image';
import Link from 'next/link';
import type { OrderSummary } from '@banovit/api-client';
import { cx, faDigits, formatToman, IconChevronLeft } from '@banovit/ui';
import { jalaliLong } from './format';
import { IconBag, IconCube, IconPin } from './icons';
import { OrderSteps } from './OrderSteps';

/** Order card (designs 04–07). Orders still in progress get the blue status strip. */
export function OrderCard({ order }: { order: OrderSummary }) {
  const active = order.tab === 'current';
  const pending = order.tab === 'cancelled' && order.steps.some((s) => s.state === 'current');
  const highlight = active || pending;
  const href = `/my-account/orders/${encodeURIComponent(order.number)}/`;
  return (
    <article className={cx('overflow-hidden rounded-md border', highlight ? 'border-primary bg-primary' : 'border-border bg-surface-muted')}>
      <p className={cx('flex items-center gap-1.5 px-3 py-2 text-xs', highlight ? 'text-primary-on' : 'text-text-muted')}>
        <IconCube size={14} />
        <span>وضعیت سفارش:</span>
        <span className="font-bold">{order.status_label}</span>
        {active && order.ordered_at ? <span className="ms-auto opacity-80">{jalaliLong(order.ordered_at)}</span> : null}
      </p>
      <div className="rounded-md bg-surface p-3">
        <Link href={href} className="flex items-center gap-3">
          <span className={cx('inline-flex size-11 shrink-0 items-center justify-center rounded-full', highlight ? 'bg-primary-subtle text-primary' : 'bg-surface-muted text-text-muted')}>
            <IconBag size={20} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-extrabold text-text">سفارش {faDigits(order.number)}</span>
            <span className="mt-0.5 block text-xs text-text-muted">
              {order.delivery_date ? `تاریخ تحویل: ${jalaliLong(order.delivery_date)}` : order.ordered_at ? `تاریخ سفارش: ${jalaliLong(order.ordered_at)}` : null}
            </span>
          </span>
          <IconChevronLeft size={18} className="text-text-muted" />
          <span className="sr-only">مشاهده جزئیات</span>
        </Link>

        {highlight && order.steps.length ? (
          <div className="mt-3">
            <OrderSteps steps={order.steps} />
          </div>
        ) : null}

        {active && order.address_line ? (
          <p className="mt-3 flex items-center gap-1.5 truncate rounded-sm bg-surface-muted px-2.5 py-2 text-xs text-text-muted">
            <IconPin size={14} className="shrink-0" />
            <span className="truncate">{order.address_line}</span>
          </p>
        ) : null}

        <div className="mt-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] text-text-muted">مبلغ پرداخت شده</p>
            <p className="mt-0.5 text-base font-extrabold text-text">
              {formatToman(order.total.amount)} <span className="text-sm">تومان</span>
            </p>
          </div>
          <Thumbs images={order.item_images} />
        </div>
      </div>
    </article>
  );
}

export function Thumbs({ images }: { images: OrderSummary['item_images'] }) {
  if (!images.length) return null;
  return (
    <ul className="flex gap-1.5" aria-label="کالاهای سفارش">
      {images.map((img, i) => (
        <li key={i} className="relative size-11 overflow-hidden rounded-sm border border-border bg-surface">
          <Image src={img.url} alt={img.alt ?? ''} fill sizes="44px" className="object-cover" />
        </li>
      ))}
    </ul>
  );
}
