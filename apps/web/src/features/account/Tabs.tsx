import Link from 'next/link';
import { cx, faDigits } from '@banovit/ui';

export interface TabItem {
  key: string;
  label: string;
  href: string;
  count?: number;
}

/** Underlined tabs with a count chip, as in «سفارش ها» / «پشتیبانی». Links, so each tab is a URL. */
export function Tabs({ items, active, label }: { items: TabItem[]; active: string; label: string }) {
  return (
    <nav aria-label={label} className="-mx-4 overflow-x-auto scrollbar-none lg:mx-0">
      <ul className="flex min-w-max border-b border-border px-4 lg:px-0">
        {items.map((t) => {
          const on = t.key === active;
          return (
            <li key={t.key} className="flex-1">
              <Link
                href={t.href}
                aria-current={on ? 'page' : undefined}
                replace
                scroll={false}
                className={cx(
                  'flex h-11 items-center justify-center gap-2 border-b-2 px-4 text-sm whitespace-nowrap',
                  on ? 'border-primary font-bold text-text' : 'border-transparent text-text-muted hover:text-text',
                )}
              >
                {t.label}
                {t.count !== undefined ? (
                  <span className={cx('min-w-6 rounded-xs px-1.5 text-center text-xs leading-5', on ? 'bg-primary-subtle text-primary-on-subtle' : 'bg-surface-muted text-text-muted')}>
                    {faDigits(t.count)}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
