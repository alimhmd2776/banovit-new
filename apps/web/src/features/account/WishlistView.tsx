'use client';

import { useNavRouter as useRouter } from '@/lib/use-nav-router';
import { useState } from 'react';
import type { ProductCard as Card } from '@banovit/api-client';
import { cx, faDigits, IconHeart, IconSort, Switch } from '@banovit/ui';
import { withProgress } from '@/lib/nav-progress';
import { me } from './client';
import { EmptyState } from './EmptyState';

const SORTS = [
  { key: 'newest', label: 'جدیدترین' },
  { key: 'price_asc', label: 'ارزان‌ترین' },
  { key: 'price_desc', label: 'گران‌ترین' },
  { key: 'discount', label: 'بیشترین تخفیف' },
];

/**
 * «علاقه‌مندی ها» (designs 10, 11). Cards are rendered by the server
 * (ProductCard from @banovit/ui) and passed in as `cards`; this adds sort,
 * the alert switch, «افزودن به سبد» and the remove heart.
 */
export function WishlistView({ products, cards, sort, notify: initialNotify }: { products: Card[]; cards: React.ReactNode[]; sort: string; notify: boolean }) {
  const router = useRouter();
  const [notify, setNotify] = useState(initialNotify);
  const [removed, setRemoved] = useState<Set<string>>(new Set());
  const [sortOpen, setSortOpen] = useState(false);
  const [msg, setMsg] = useState('');
  const [adding, setAdding] = useState<string | null>(null);
  const visible = products.map((p, i) => ({ p, card: cards[i] })).filter(({ p }) => !removed.has(p.slug));

  const addToCart = async (p: Card) => {
    setMsg('');
    setAdding(p.slug);
    const res = await withProgress(() => fetch('/api/cart/items/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ product_id: p.id, quantity: 1 }),
      credentials: 'same-origin',
    }).catch(() => null)).finally(() => setAdding(null));
    if (res?.ok) {
      const j = (await res.json().catch(() => null)) as { data?: { item_count?: number } } | null;
      window.dispatchEvent(new CustomEvent('cart:updated', { detail: { item_count: j?.data?.item_count } }));
      setMsg(`«${p.name}» به سبد خرید اضافه شد.`);
    } else {
      // Variable products need a color/size choice: open the product page.
      router.push(p.path);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between gap-3 py-3">
        <p className="text-sm text-text-muted">همه کالا <span aria-hidden="true">•</span> {faDigits(visible.length)} محصول</p>
        <div className="relative">
          <button type="button" aria-expanded={sortOpen} onClick={() => setSortOpen(!sortOpen)} className="inline-flex h-10 items-center gap-2 rounded-full border border-border px-4 text-sm">
            <IconSort size={16} /> مرتب سازی
          </button>
          {sortOpen ? (
            <ul className="absolute end-0 top-11 z-10 w-40 overflow-hidden rounded-sm border border-border bg-surface shadow-md">
              {SORTS.map((s) => (
                <li key={s.key}>
                  <button type="button" onClick={() => { setSortOpen(false); router.replace(s.key === 'newest' ? '/my-account/wishlist/' : `/my-account/wishlist/?sort=${s.key}`); }} className={cx('block w-full px-3 py-2.5 text-start text-sm hover:bg-surface-muted', sort === s.key && 'font-bold text-primary')}>
                    {s.label}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      <div className="rounded-md bg-surface-muted px-4">
        <Switch
          checked={notify}
          label="اطلاع رسانی ها"
          description="موجودی یا تخفیفات محصولات برای این کالا ها"
          onChange={async (v) => {
            setNotify(v);
            await me('PATCH', 'wishlist/settings', { notify: v }).catch(() => setNotify(!v));
          }}
        />
      </div>
      <p aria-live="polite" className="mt-2 text-xs text-success">{msg}</p>

      {visible.length ? (
        <ul className="mt-2 divide-y divide-border lg:grid lg:grid-cols-3 lg:gap-4 lg:divide-y-0 xl:grid-cols-4">
          {visible.map(({ p, card }) => (
            <li key={p.slug} className="pb-4 lg:pb-0">
              {card}
              <div className="flex items-center gap-3 lg:mt-2">
                <button type="button" onClick={() => addToCart(p)} disabled={!p.in_stock || adding !== null} data-busy={adding === p.slug || undefined} className="h-11 flex-1 rounded-sm border border-border text-sm font-bold text-primary hover:bg-primary-subtle disabled:text-text-subtle">
                  {p.in_stock ? 'افزودن به سبد' : 'ناموجود'}
                </button>
                <button
                  type="button"
                  aria-label={`حذف ${p.name} از علاقه‌مندی ها`}
                  onClick={async () => {
                    setRemoved((s) => new Set(s).add(p.slug));
                    await me('DELETE', `wishlist/${encodeURIComponent(p.slug)}`).catch(() => setRemoved((s) => { const n = new Set(s); n.delete(p.slug); return n; }));
                  }}
                  className="inline-flex size-11 items-center justify-center rounded-sm border border-border text-danger hover:bg-danger-subtle"
                >
                  <IconHeart size={22} fill="currentColor" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState art="wishlist" title="هنوز محصولی به علاقه‌مندی‌ها اضافه نکرده‌اید!" text="می‌توانید در فروشگاه بانویت سر بزنید و محصولات موردعلاقه خود را برای مشاهده و بررسی در آینده ذخیره کنید." action={{ label: 'فروشگاه بانویت', href: '/shop/' }} />
      )}
    </>
  );
}
