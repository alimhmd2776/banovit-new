'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { cx } from '@banovit/ui';

export type SellerTabKey = 'products' | 'reviews' | 'details';

const TABS: { key: SellerTabKey; label: string }[] = [
  { key: 'products', label: 'محصولات' },
  { key: 'reviews', label: 'نظرات کاربران' },
  { key: 'details', label: 'جزئیات فروشگاه' },
];

function fromHash(): SellerTabKey | null {
  const h = window.location.hash.replace('#', '');
  return TABS.some((t) => t.key === h) ? (h as SellerTabKey) : null;
}

/**
 * Tabs of the seller profile. All three panels are rendered on the server and
 * stay in the HTML (only `hidden`), so crawlers and no-JS visitors get every
 * section; the hash (#reviews, #details) makes a tab linkable.
 */
export function SellerTabs({ panels }: { panels: Record<SellerTabKey, ReactNode> }) {
  const [tab, setTab] = useState<SellerTabKey>('products');

  useEffect(() => {
    const sync = () => setTab(fromHash() ?? 'products');
    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  const select = (key: SellerTabKey) => {
    setTab(key);
    window.history.replaceState(null, '', key === 'products' ? window.location.pathname + window.location.search : `#${key}`);
  };

  return (
    <div>
      <div role="tablist" aria-label="بخش‌های فروشگاه" className="grid grid-cols-3 border-b border-border lg:flex lg:gap-8">
        {TABS.map((t) => (
          <button
            key={t.key}
            id={`seller-tab-${t.key}`}
            role="tab"
            type="button"
            aria-selected={tab === t.key}
            aria-controls={`seller-panel-${t.key}`}
            onClick={() => select(t.key)}
            onKeyDown={(e) => {
              if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
              const i = TABS.findIndex((x) => x.key === tab);
              // RTL: ArrowLeft moves to the next tab.
              const next = TABS[(i + (e.key === 'ArrowLeft' ? 1 : TABS.length - 1)) % TABS.length]!;
              select(next.key);
              document.getElementById(`seller-tab-${next.key}`)?.focus();
            }}
            tabIndex={tab === t.key ? 0 : -1}
            className={cx(
              '-mb-px border-b-2 px-2 py-3 text-sm transition-colors lg:px-1 lg:text-base',
              tab === t.key ? 'border-primary font-bold text-text' : 'border-transparent text-text-muted hover:text-text',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      {TABS.map((t) => (
        <section
          key={t.key}
          id={`seller-panel-${t.key}`}
          role="tabpanel"
          aria-labelledby={`seller-tab-${t.key}`}
          hidden={tab !== t.key}
          className="pt-4 lg:pt-6"
        >
          {panels[t.key]}
        </section>
      ))}
    </div>
  );
}
