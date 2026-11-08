import Link from 'next/link';

/** «بانُویت / طراوتی نو در خانه تو» wordmark (text + mark until the SVG logo asset is in the repo). */
export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" aria-label="بانویت، صفحه اصلی" className="inline-flex shrink-0 items-center gap-2">
      {compact ? null : (
        <span className="hidden size-9 items-center justify-center rounded-sm bg-primary-subtle text-sm font-black text-primary lg:inline-flex" aria-hidden="true">
          بانُ
        </span>
      )}
      <span className="leading-tight">
        <span className="block text-xl font-black text-primary">بانُویت</span>
        {compact ? null : <span className="hidden text-[10px] text-text-subtle lg:block">طراوتی نو در خانه تو</span>}
      </span>
    </Link>
  );
}
