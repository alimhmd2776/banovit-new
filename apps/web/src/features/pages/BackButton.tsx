'use client';

import { useNavRouter as useRouter } from '@/lib/use-nav-router';
import { IconChevronRight } from '@banovit/ui';

/** App-bar back: previous page when we came from this site, otherwise `fallback`. */
export function BackButton({ fallback }: { fallback: string }) {
  const router = useRouter();
  return (
    <a
      href={fallback}
      onClick={(e) => {
        const sameSite = typeof document !== 'undefined' && document.referrer.startsWith(window.location.origin);
        if (sameSite && window.history.length > 1) {
          e.preventDefault();
          router.back();
        }
      }}
      aria-label="بازگشت"
      className="inline-flex size-11 shrink-0 items-center justify-center rounded-md border border-border bg-surface text-text hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-focus"
    >
      <IconChevronRight size={22} />
    </a>
  );
}
