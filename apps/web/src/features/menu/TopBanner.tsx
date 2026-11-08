'use client';

import { useEffect, useState } from 'react';
import type { HeaderSettings } from '@banovit/api-client';
import { cx } from '@banovit/ui';
import { MenuLink } from './parts';

type Slide = HeaderSettings['top_banner']['slides'][number];

/**
 * Rotating banner above the header (WordPress #my-top-banner): one slide at a
 * time, desktop and mobile images, switch every `interval` seconds. Slides,
 * images, links and timing come from «تنظیمات هدر» in the CMS.
 */
export function TopBanner({ slides, interval }: { slides: Slide[]; interval: number }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => setActive((i) => (i + 1) % slides.length), Math.max(2, interval) * 1000);
    return () => window.clearInterval(id);
  }, [slides.length, interval]);

  if (!slides.length) return null;

  return (
    <div className="relative bg-primary leading-[0]" aria-roledescription="carousel" aria-label="بنر">
      {slides.map((s, i) => {
        const img = (
          <picture>
            {s.mobile_image ? <source media="(max-width: 767px)" srcSet={s.mobile_image} width={540} height={40} /> : null}
            {/* eslint-disable-next-line @next/next/no-img-element -- animated GIF banners from the media library */}
            <img src={s.image} alt={s.alt ?? ''} width={1920} height={64} className="block h-auto w-full" loading={i === 0 ? 'eager' : 'lazy'} fetchPriority={i === 0 ? 'high' : 'auto'} />
          </picture>
        );
        return (
          <div key={i} className={cx(i === active ? 'block' : 'hidden')} aria-hidden={i !== active}>
            {s.url ? (
              <MenuLink href={s.url} tabIndex={i === active ? undefined : -1}>
                {img}
              </MenuLink>
            ) : (
              img
            )}
          </div>
        );
      })}
    </div>
  );
}
