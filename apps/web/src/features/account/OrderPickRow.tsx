import Link from 'next/link';
import type { OrderSummary } from '@banovit/api-client';
import { faDigits, formatToman, IconChevronLeft } from '@banovit/ui';
import { jalaliLong } from './format';
import { IconBag } from './icons';
import { Thumbs } from './OrderCard';

/** Compact order row for the support flow (designs 31, 33). With `href` it is a link (select-order list). */
export function OrderPickRow({ order, href, showTotal = true }: { order: OrderSummary; href?: string; showTotal?: boolean }) {
  const head = (
    <span className="flex items-center gap-3">
      <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-primary text-primary">
        <IconBag size={20} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-extrabold text-text">سفارش {faDigits(order.number)}</span>
        {order.ordered_at ? <span className="mt-0.5 block text-xs text-text-muted">تاریخ سفارش: {jalaliLong(order.ordered_at)}</span> : null}
      </span>
      <span className="shrink-0 rounded-full border border-primary-subtle bg-primary-subtle/40 px-3 py-1 text-xs text-primary">{order.status_label}</span>
      {href ? <IconChevronLeft size={18} className="shrink-0 text-text-muted" /> : null}
    </span>
  );
  const body = (
    <>
      {head}
      {showTotal ? (
        <span className="mt-3 flex items-end justify-between gap-3">
          <span>
            <span className="block text-[11px] text-text-muted">مبلغ پرداخت شده</span>
            <span className="mt-0.5 block font-extrabold text-text">
              {formatToman(order.total.amount)} <span className="text-sm">تومان</span>
            </span>
          </span>
          <Thumbs images={order.item_images} />
        </span>
      ) : null}
    </>
  );
  return href ? (
    <Link href={href} className="block py-4 hover:bg-surface-muted">
      {body}
    </Link>
  ) : (
    <div className="py-4">{body}</div>
  );
}
