import Link from 'next/link';
import { IconChevronRight } from '@banovit/ui';

/**
 * Page title bar from the designs: back button (start), title + subtitle,
 * optional action buttons (end). Sticky on phones; on desktop it is the
 * page heading inside the account layout.
 */
export function AppBar({
  title,
  subtitle,
  backHref = '/my-account/',
  actions,
  children,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  backHref?: string | null;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="sticky top-0 z-sticky -mx-4 border-b border-border bg-surface/95 px-4 backdrop-blur lg:static lg:mx-0 lg:border-none lg:bg-transparent lg:px-0 lg:backdrop-blur-none">
      <div className="flex min-h-[72px] items-center gap-3 py-3 lg:min-h-0 lg:pb-4 lg:pt-0">
        {backHref ? (
          <Link href={backHref} aria-label="بازگشت" className="inline-flex size-11 shrink-0 items-center justify-center rounded-md border border-border bg-surface text-text hover:bg-surface-muted lg:hidden">
            <IconChevronRight size={22} />
          </Link>
        ) : null}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-extrabold text-text lg:text-xl">{title}</h1>
          {subtitle ? <p className="mt-0.5 text-xs text-text-muted">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </div>
      {children}
    </div>
  );
}

export const appBarButton =
  'inline-flex size-11 items-center justify-center rounded-md border border-border bg-surface text-text hover:bg-surface-muted disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus';
