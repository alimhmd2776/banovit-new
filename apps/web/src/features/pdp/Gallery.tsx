'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import type { Image as ImageData } from '@banovit/api-client';
import { cx, faDigits, IconImage } from '@banovit/ui';

/**
 * Product gallery. Mobile: swipeable scroll-snap strip with the next image
 * peeking and a counter. Desktop: large image with a thumbnail column.
 * Every image is in the HTML (crawlable); only the first is priority (LCP).
 */
export function Gallery({ images, name }: { images: ImageData[]; name: string }) {
  const [active, setActive] = useState(0);
  const strip = useRef<HTMLUListElement>(null);

  if (!images.length) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-lg bg-surface-muted text-text-subtle">
        <IconImage size={48} />
      </div>
    );
  }

  function onScroll() {
    const el = strip.current;
    if (!el) return;
    const w = el.firstElementChild?.getBoundingClientRect().width ?? el.clientWidth;
    // RTL: scrollLeft is 0 at the start and negative going forward.
    setActive(Math.min(images.length - 1, Math.round(Math.abs(el.scrollLeft) / (w + 8))));
  }

  function show(i: number) {
    setActive(i);
    const el = strip.current?.children[i] as HTMLElement | undefined;
    el?.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
  }

  return (
    <div className="lg:flex lg:gap-3">
      {/* thumbnails (desktop) */}
      {images.length > 1 ? (
        <ul className="hidden max-h-[520px] w-20 shrink-0 flex-col gap-2 overflow-y-auto scrollbar-none lg:flex" aria-label="تصاویر محصول">
          {images.map((img, i) => (
            <li key={img.url}>
              <button
                type="button"
                onClick={() => show(i)}
                aria-label={`تصویر ${faDigits(i + 1)}`}
                aria-current={i === active || undefined}
                className={cx('relative block size-20 overflow-hidden rounded-sm border bg-surface', i === active ? 'border-primary ring-1 ring-primary' : 'border-border hover:border-border-strong')}
              >
                <Image src={img.url} alt="" fill sizes="80px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="relative min-w-0 flex-1">
        <ul
          ref={strip}
          onScroll={onScroll}
          className="-mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 scrollbar-none lg:mx-0 lg:px-0"
          aria-roledescription="carousel"
          aria-label={`تصاویر ${name}`}
        >
          {images.map((img, i) => (
            <li
              key={img.url}
              className="relative aspect-[4/5] w-[82%] shrink-0 snap-start overflow-hidden rounded-lg bg-surface-muted sm:w-[60%] lg:aspect-square lg:w-full"
              aria-label={`${faDigits(i + 1)} از ${faDigits(images.length)}`}
            >
              <Image
                src={img.url}
                alt={img.alt || name}
                fill
                priority={i === 0}
                fetchPriority={i === 0 ? 'high' : undefined}
                sizes="(min-width: 1024px) 560px, 82vw"
                className="object-cover"
              />
            </li>
          ))}
        </ul>
        {images.length > 1 ? (
          <span className="pointer-events-none absolute bottom-3 start-3 inline-flex items-center gap-1.5 rounded-full bg-text/70 px-2.5 py-1 text-xs text-primary-on lg:hidden" aria-hidden>
            <IconImage size={14} />
            {faDigits(active + 1)} / {faDigits(images.length)}
          </span>
        ) : null}
      </div>
    </div>
  );
}
