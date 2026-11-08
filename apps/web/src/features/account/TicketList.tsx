import Link from 'next/link';
import type { TicketSummary } from '@banovit/api-client';
import { cx, faDigits, IconChevronLeft } from '@banovit/ui';
import { IconComment } from './icons';

/** Ticket rows (designs 35, 37). */
export function TicketList({ items }: { items: TicketSummary[] }) {
  return (
    <ul className="mt-2">
      {items.map((t) => (
        <li key={t.id} className="border-b border-border">
          <Link href={`/my-account/support/tickets/${t.id}/`} className="flex items-center gap-3 py-4 hover:bg-surface-muted">
            <span
              className={cx(
                'inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-border',
                t.status === 'in_review' ? 'text-warning' : t.status === 'awaiting_customer' ? 'text-primary' : 'text-success',
              )}
            >
              <IconComment size={18} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-bold text-text">تیکت شماره {faDigits(t.number)}</span>
              <span className="mt-1 block truncate text-xs text-text-muted">
                {t.subject} · وضعیت: {t.status_label}
              </span>
            </span>
            <IconChevronLeft size={18} className="text-text-muted" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
