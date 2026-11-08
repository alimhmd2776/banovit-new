import Link from 'next/link';
import { IconChevronLeft } from './icons';
import { cx } from './lib/format';

export type BreadcrumbItem = { name: string; url?: string };

/**
 * Visible breadcrumb (the BreadcrumbList JSON-LD is emitted by the page from
 * the same items). The last item is the current page and is not a link.
 */
export function Breadcrumb({ items, className }: { items: BreadcrumbItem[]; className?: string }) {
  return (
    <nav aria-label="مسیر صفحه" className={cx('text-xs text-text-muted', className)}>
      <ol className="flex items-center gap-1 overflow-x-auto whitespace-nowrap [scrollbar-width:none]">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${item.name}-${i}`} className="flex items-center gap-1">
              {last || !item.url ? (
                <span aria-current={last ? 'page' : undefined} className={last ? 'text-text' : undefined}>
                  {item.name}
                </span>
              ) : (
                <Link href={item.url} className="hover:text-primary focus-visible:outline-2 focus-visible:outline-focus">
                  {item.name}
                </Link>
              )}
              {!last && <IconChevronLeft size={14} className="text-text-subtle" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
