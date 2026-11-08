import Link from 'next/link';
import type { ReactNode } from 'react';
import { IconChevronRight } from '@banovit/ui';

/**
 * Title bar of the cart/checkout screens: optional back button (start side,
 * chevron points right in RTL), title, a dot-separated subtitle and an
 * optional action on the end side.
 */
export function PageHeader({
  title,
  subtitle,
  backHref,
  backLabel = 'بازگشت',
  action,
}: {
  title: string;
  subtitle?: ReactNode[];
  backHref?: string;
  backLabel?: string;
  action?: ReactNode;
}) {
  return (
    <div className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-container items-center gap-3 px-4 py-4 lg:py-5">
        {backHref ? (
          <Link
            href={backHref}
            aria-label={backLabel}
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-md border border-border text-text hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-focus"
          >
            <IconChevronRight size={22} />
          </Link>
        ) : null}
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-bold text-text lg:text-xl">{title}</h1>
          {subtitle?.length ? (
            <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-text-muted">
              {subtitle.filter(Boolean).map((s, i) => (
                <span key={i} className="inline-flex items-center gap-2">
                  {i > 0 ? <span aria-hidden="true" className="size-1 rounded-full bg-text-subtle" /> : null}
                  {s}
                </span>
              ))}
            </p>
          ) : null}
        </div>
        {action}
      </div>
    </div>
  );
}
