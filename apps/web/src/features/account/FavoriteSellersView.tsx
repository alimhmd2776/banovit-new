'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import type { SellerCard } from '@banovit/api-client';
import { faDigits, IconHeart, IconStar, IconStore } from '@banovit/ui';
import { me } from './client';
import { EmptyState } from './EmptyState';

function Logo({ seller }: { seller: SellerCard }) {
  return seller.logo ? (
    <Image
      src={seller.logo.url}
      alt={seller.logo.alt ?? seller.name}
      width={56}
      height={56}
      unoptimized={/\.svg(\?|$)/i.test(seller.logo.url)}
      className="size-14 shrink-0 rounded-lg border border-border bg-surface object-contain"
    />
  ) : (
    <span className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-primary-subtle text-primary" aria-hidden="true">
      <IconStore size={26} />
    </span>
  );
}

/** List of liked sellers; the heart removes one (optimistic, restored on error). */
export function FavoriteSellersView({ sellers }: { sellers: SellerCard[] }) {
  const [removed, setRemoved] = useState<Set<string>>(new Set());
  const visible = sellers.filter((s) => !removed.has(s.slug));

  if (!visible.length) {
    return <EmptyState art="sellers" title="هنوز فروشگاهی را لایک نکرده‌اید!" text="با زدن قلب در برگه هر فروشگاه، آن را اینجا داشته باشید." />;
  }

  const unlike = async (slug: string) => {
    setRemoved((s) => new Set(s).add(slug));
    await me('DELETE', `seller-likes/${encodeURIComponent(slug)}`).catch(() =>
      setRemoved((s) => {
        const n = new Set(s);
        n.delete(slug);
        return n;
      }),
    );
  };

  return (
    <ul className="flex flex-col gap-3 p-4">
      {visible.map((s) => (
        <li key={s.slug} className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3">
          <Link href={s.url} className="flex min-w-0 flex-1 items-center gap-3">
            <Logo seller={s} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold text-text">{s.name}</span>
              {s.tagline ? <span className="mt-1 block truncate text-xs text-text-muted">{s.tagline}</span> : null}
              {s.stats?.rating?.count ? (
                <span className="mt-1 inline-flex items-center gap-1 text-xs text-text-muted">
                  <IconStar size={14} className="text-rating" /> {faDigits(s.stats.rating.average)}
                </span>
              ) : null}
            </span>
          </Link>
          <button
            type="button"
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-md text-danger hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
            aria-label={`حذف ${s.name} از فروشگاه‌های محبوب`}
            onClick={() => unlike(s.slug)}
          >
            <IconHeart fill="currentColor" />
          </button>
        </li>
      ))}
    </ul>
  );
}
