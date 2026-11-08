import Link from 'next/link';
import { IconChevronLeft, IconChevronRight } from './icons';
import { cx, faDigits } from './lib/format';

/** Page window with ellipses: 1 … 4 5 [6] 7 8 … 20 */
export function pageWindow(current: number, last: number, radius = 1): (number | 'gap')[] {
  const pages = new Set<number>([1, last]);
  for (let p = current - radius; p <= current + radius; p++) if (p >= 1 && p <= last) pages.add(p);
  const sorted = [...pages].sort((a, b) => a - b);
  const out: (number | 'gap')[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1]! > 1) out.push('gap');
    out.push(p);
  });
  return out;
}

/**
 * Crawlable page links (real <a href>), matching WordPress /page/N/ URLs so
 * paginated category pages keep their indexed addresses.
 */
export function Pagination({
  current,
  last,
  hrefFor,
  className,
}: {
  current: number;
  last: number;
  hrefFor: (page: number) => string;
  className?: string;
}) {
  if (last <= 1) return null;
  const btn = 'inline-flex h-10 min-w-10 items-center justify-center rounded-sm px-2 text-sm';
  return (
    <nav aria-label="صفحه‌بندی" className={cx('flex items-center justify-center gap-1', className)}>
      {current > 1 ? (
        <Link href={hrefFor(current - 1)} rel="prev" className={cx(btn, 'hover:bg-surface-muted')} aria-label="صفحه قبل">
          <IconChevronRight />
        </Link>
      ) : null}
      {pageWindow(current, last).map((p, i) =>
        p === 'gap' ? (
          <span key={`gap-${i}`} className={cx(btn, 'text-text-subtle')}>
            …
          </span>
        ) : p === current ? (
          <span key={p} aria-current="page" className={cx(btn, 'bg-primary font-bold text-primary-on')}>
            {faDigits(p)}
          </span>
        ) : (
          <Link key={p} href={hrefFor(p)} className={cx(btn, 'hover:bg-surface-muted')}>
            {faDigits(p)}
          </Link>
        ),
      )}
      {current < last ? (
        <Link href={hrefFor(current + 1)} rel="next" className={cx(btn, 'hover:bg-surface-muted')} aria-label="صفحه بعد">
          <IconChevronLeft />
        </Link>
      ) : null}
    </nav>
  );
}
