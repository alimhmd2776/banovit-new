'use client';

import { useNavRouter as useRouter } from '@/lib/use-nav-router';
import { useEffect, useState } from 'react';
import { cx, IconChevronRight, IconHeart, IconShare } from '@banovit/ui';

const FAVORITES_KEY = 'bnv:favorite-sellers';

function readFavorites(): string[] {
  try {
    const raw = window.localStorage.getItem(FAVORITES_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

const iconButton =
  'inline-flex size-11 items-center justify-center rounded-md border border-border bg-surface text-text hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus';

/** «بازگشت» in the mobile app bar: history back when the visitor came from this site, else home. */
export function BackButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      className={iconButton}
      aria-label="بازگشت"
      onClick={() => (window.history.length > 1 && document.referrer.startsWith(window.location.origin) ? router.back() : router.push('/'))}
    >
      <IconChevronRight size={22} />
    </button>
  );
}

/**
 * Share + favorite. The favorite is kept in this browser only until the
 * account API has a «فروشگاه‌های محبوب» list; then it moves server-side.
 */
export function SellerActions({ slug, name, url }: { slug: string; name: string; url: string }) {
  const [favorite, setFavorite] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => setFavorite(readFavorites().includes(slug)), [slug]);

  const toggleFavorite = () => {
    const next = !favorite;
    setFavorite(next);
    try {
      const list = readFavorites().filter((s) => s !== slug);
      window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(next ? [...list, slug] : list));
    } catch {
      /* storage blocked: state still toggles for this view */
    }
  };

  const share = async () => {
    const href = new URL(url, window.location.origin).toString();
    try {
      if (navigator.share) {
        await navigator.share({ title: name, url: href });
        return;
      }
      await navigator.clipboard.writeText(href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* dismissed */
    }
  };

  return (
    <div className="relative flex items-center gap-2">
      <button type="button" className={iconButton} aria-label="اشتراک‌گذاری فروشگاه" onClick={share}>
        <IconShare />
      </button>
      <button
        type="button"
        className={cx(iconButton, favorite && 'text-danger')}
        aria-label={favorite ? 'حذف از فروشگاه‌های محبوب' : 'افزودن به فروشگاه‌های محبوب'}
        aria-pressed={favorite}
        onClick={toggleFavorite}
      >
        <IconHeart fill={favorite ? 'currentColor' : 'none'} />
      </button>
      <span role="status" aria-live="polite" className={cx('absolute end-0 top-full mt-1 whitespace-nowrap rounded-sm bg-text px-2 py-1 text-xs text-surface', !copied && 'sr-only')}>
        {copied ? 'لینک فروشگاه کپی شد' : ''}
      </span>
    </div>
  );
}
