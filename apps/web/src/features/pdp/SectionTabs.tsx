'use client';

import { useEffect, useState } from 'react';
import { cx } from '@banovit/ui';

export type SectionTab = { id: string; label: string };

/** Sticky in-page tabs (مشخصات / بررسی تخصصی / دیدگاه کاربران / پیشنهاد ما) with scroll-spy. */
export function SectionTabs({ tabs }: { tabs: SectionTab[] }) {
  const [active, setActive] = useState(tabs[0]?.id);

  useEffect(() => {
    const els = tabs.map((t) => document.getElementById(t.id)).filter((e): e is HTMLElement => !!e);
    if (!els.length || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entries) => {
        const top = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (top) setActive(top.target.id);
      },
      { rootMargin: '-120px 0px -60% 0px' },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [tabs]);

  if (tabs.length < 2) return null;
  return (
    <nav aria-label="بخش‌های صفحه محصول" className="sticky top-header z-20 -mx-4 border-b border-border bg-surface/95 backdrop-blur lg:mx-0 lg:rounded-t-md">
      <ul className="flex gap-1 overflow-x-auto px-4 scrollbar-none">
        {tabs.map((t) => (
          <li key={t.id} className="shrink-0">
            <a
              href={`#${t.id}`}
              aria-current={active === t.id ? 'location' : undefined}
              className={cx(
                'block border-b-2 px-3 py-3 text-sm transition-colors',
                active === t.id ? 'border-primary font-bold text-primary' : 'border-transparent text-text-muted hover:text-text',
              )}
            >
              {t.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
