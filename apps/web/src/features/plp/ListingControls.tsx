'use client';

import { useNavRouter as useRouter } from '@/lib/use-nav-router';
import { useCallback, useState, useTransition } from 'react';
import type { ListingMeta, SortKey } from '@banovit/api-client';
import { BottomSheet, Chip, cx, faDigits, FilterPill, IconCheck, IconSliders, IconSort } from '@banovit/ui';

const IconLines = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
    <path d="M4 7h16M7 12h10M10 17h4" />
  </svg>
);
import { FilterPanel } from './FilterPanel';
import { FilterSheet, priceBounds, type FilterView } from './FilterSheet';
import { clearFilters, hasActiveFilters, toQueryString, toggleValue, type ListingState } from './url-state';

/** Navigates to basePath + the state's query (always page 1: a new filter set starts over). */
function useListingNavigation(basePath: string) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const go = useCallback(
    (next: ListingState) => startTransition(() => router.push(`${basePath}${toQueryString(next)}`, { scroll: false })),
    [router, basePath],
  );
  return { go, pending };
}

const QUICK_FACETS = 2; // attribute chips after «برند» and «بازه قیمتی»

/**
 * Mobile: chip row (sort, filter with count, quick chips for brand / price /
 * first facets) opening bottom sheets, then removable pills. Desktop (lg):
 * inline sort tabs; the filters live in <FilterSidebar>.
 */
export function ListingToolbar({ meta, state, basePath }: { meta: ListingMeta; state: ListingState; basePath: string }) {
  const { go, pending } = useListingNavigation(basePath);
  const [sortOpen, setSortOpen] = useState(false);
  const [filterView, setFilterView] = useState<FilterView | null>(null);
  const sortLabel = meta.sorts.find((s) => s.value === state.sort)?.label ?? 'مرتب‌سازی';
  const activeCount = meta.applied.length;
  const brand = meta.facets.find((f) => f.key === 'brand');
  const quick = meta.facets.filter((f) => f.key !== 'brand').slice(0, QUICK_FACETS);
  const hasPrice = priceBounds(meta) !== null;

  const removePill = (facet: string, value: string) => {
    if (facet === 'price') return go({ ...state, minToman: null, maxToman: null });
    if (facet === 'in_stock') return go({ ...state, inStock: false });
    if (facet === 'on_sale') return go({ ...state, onSale: false });
    go(toggleValue(state, facet, value));
  };

  return (
    <div className={cx('transition-opacity', pending && 'opacity-60')} aria-busy={pending}>
      {/* mobile */}
      <div className="-mx-4 -mt-2 flex items-center gap-2 overflow-x-auto px-4 pb-1 pt-2 scrollbar-none lg:hidden">
        <Chip icon={<IconLines />} onClick={() => setSortOpen(true)} aria-haspopup="dialog">
          {sortLabel}
        </Chip>
        <Chip
          icon={<IconSliders size={18} />}
          active={activeCount > 0}
          onClick={() => setFilterView('root')}
          aria-haspopup="dialog"
          aria-label={activeCount ? `فیلتر، ${faDigits(activeCount)} فیلتر فعال` : 'فیلتر'}
        >
          فیلتر
          {activeCount ? (
            <span className="absolute -start-1 -top-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-on">
              {faDigits(activeCount)}
            </span>
          ) : null}
        </Chip>
        {brand ? (
          <Chip active={(state.facets.brand?.length ?? 0) > 0} onClick={() => setFilterView('brand')} aria-haspopup="dialog">
            برند
          </Chip>
        ) : null}
        {hasPrice ? (
          <Chip active={state.minToman !== null || state.maxToman !== null} onClick={() => setFilterView('price')} aria-haspopup="dialog">
            بازه قیمتی
          </Chip>
        ) : null}
        {quick.map((f) => (
          <Chip key={f.key} active={(state.facets[f.key]?.length ?? 0) > 0} onClick={() => setFilterView(f.key)} aria-haspopup="dialog">
            {f.label}
          </Chip>
        ))}
      </div>
      <p className="sr-only" aria-live="polite">{faDigits(meta.total)} کالا</p>

      {/* desktop */}
      <div className="hidden items-center gap-1 border-b border-border pb-3 lg:flex">
        <IconSort size={18} className="text-text-muted" />
        <span className="me-2 text-sm font-bold text-text">مرتب‌سازی:</span>
        {meta.sorts.map((s) => (
          <button
            key={s.value}
            type="button"
            aria-pressed={s.value === state.sort}
            onClick={() => go({ ...state, sort: s.value as SortKey })}
            className={cx(
              'rounded-sm px-3 py-1.5 text-sm',
              s.value === state.sort ? 'bg-primary-subtle font-bold text-primary-on-subtle' : 'text-text-muted hover:text-text',
            )}
          >
            {s.label}
          </button>
        ))}
        <span className="ms-auto text-sm text-text-muted">{faDigits(meta.total)} کالا</span>
      </div>

      {meta.applied.length ? (
        <div className="-mx-4 mt-3 flex items-center gap-2 overflow-x-auto px-4 scrollbar-none lg:mx-0 lg:flex-wrap lg:px-0">
          {meta.applied.map((p) => (
            <FilterPill key={`${p.facet}:${p.value}`} label={pillLabel(p, meta)} onRemove={() => removePill(p.facet, p.value)} />
          ))}
          <button type="button" onClick={() => go(clearFilters(state))} className="shrink-0 px-2 text-xs font-medium text-danger">
            حذف همه
          </button>
        </div>
      ) : null}

      <BottomSheet open={sortOpen} onClose={() => setSortOpen(false)} title="مرتب سازی">
        <ul className="divide-y divide-border px-4 pb-6" role="radiogroup" aria-label="مرتب‌سازی">
          {meta.sorts.map((s) => {
            const on = s.value === state.sort;
            return (
              <li key={s.value}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => {
                    setSortOpen(false);
                    go({ ...state, sort: s.value as SortKey });
                  }}
                  className="flex h-[60px] w-full items-center justify-between text-sm font-bold text-text"
                >
                  {s.label}
                  {on ? <IconCheck size={20} className="text-primary" /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      </BottomSheet>

      {filterView !== null ? (
        <FilterSheet
          key={filterView}
          open
          initialView={filterView}
          meta={meta}
          state={state}
          onClose={() => setFilterView(null)}
          onApply={(next) => {
            setFilterView(null);
            go(next);
          }}
        />
      ) : null}
    </div>
  );
}

export function FilterSidebar({ meta, state, basePath }: { meta: ListingMeta; state: ListingState; basePath: string }) {
  const { go, pending } = useListingNavigation(basePath);
  return (
    <aside aria-label="فیلترها" className={cx('hidden lg:block', pending && 'opacity-60')}>
      <div className="sticky top-[calc(var(--header-height)+56px)] max-h-[calc(100dvh-var(--header-height)-72px)] overflow-y-auto rounded-md border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-base font-bold text-text">فیلتر نمایش</h2>
          {hasActiveFilters(state) ? (
            <button type="button" onClick={() => go(clearFilters(state))} className="text-xs font-medium text-danger">
              حذف فیلترها
            </button>
          ) : null}
        </div>
        <FilterPanel meta={meta} state={state} onChange={go} instant />
      </div>
    </aside>
  );
}

/** Opens the mobile filter sheet from outside the toolbar (empty state «تغییر فیلتر»). */
export function ChangeFilterButton({ meta, state, basePath, label }: { meta: ListingMeta; state: ListingState; basePath: string; label: string }) {
  const { go } = useListingNavigation(basePath);
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => (window.matchMedia('(min-width: 1024px)').matches ? go(clearFilters(state)) : setOpen(true))}
        className="mt-6 inline-flex h-11 items-center rounded-sm bg-primary px-6 text-sm font-bold text-primary-on hover:bg-primary-hover"
      >
        {label}
      </button>
      {open ? (
        <FilterSheet
          open
          initialView="root"
          meta={meta}
          state={state}
          onClose={() => setOpen(false)}
          onApply={(next) => {
            setOpen(false);
            go(next);
          }}
        />
      ) : null}
    </>
  );
}

function pillLabel(p: ListingMeta['applied'][number], meta: ListingMeta): string {
  if (p.facet !== 'price') {
    const facet = meta.facets.find((f) => f.key === p.facet);
    return facet ? `${facet.key === 'brand' ? 'برند' : facet.label} ${p.label}` : p.label;
  }
  const fmt = (rial: number | null) => (rial === null ? null : faDigits(Math.round(rial / 10)));
  const lo = fmt(meta.price.selected_min);
  const hi = fmt(meta.price.selected_max);
  if (lo && hi) return `از ${lo} تا ${hi} تومان`;
  if (lo) return `از ${lo} تومان`;
  return `تا ${hi} تومان`;
}
