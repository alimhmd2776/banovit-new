'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState, useTransition } from 'react';
import type { ListingMeta, SortKey } from '@banovit/api-client';
import { BottomSheet, Chip, cx, faDigits, FilterPill, IconFilter, IconSort } from '@banovit/ui';
import { FilterPanel } from './FilterPanel';
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

/**
 * Mobile: sort + filter chips that open bottom sheets. Desktop (lg): inline sort
 * tabs; filters live in <FilterSidebar>. Both show the active-filter pills.
 */
export function ListingToolbar({ meta, state, basePath }: { meta: ListingMeta; state: ListingState; basePath: string }) {
  const { go, pending } = useListingNavigation(basePath);
  const [sheet, setSheet] = useState<'sort' | 'filter' | null>(null);
  const [draft, setDraft] = useState(state);
  const sortLabel = meta.sorts.find((s) => s.value === state.sort)?.label ?? '';
  const activeCount = meta.applied.length;

  const openFilters = () => {
    setDraft(state);
    setSheet('filter');
  };

  const removePill = (facet: string, value: string) => {
    if (facet === 'price') return go({ ...state, minToman: null, maxToman: null });
    if (facet === 'in_stock') return go({ ...state, inStock: false });
    if (facet === 'on_sale') return go({ ...state, onSale: false });
    go(toggleValue(state, facet, value));
  };

  return (
    <div className={cx('transition-opacity', pending && 'opacity-60')} aria-busy={pending}>
      {/* mobile */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none lg:hidden">
        <Chip icon={<IconSort size={16} />} onClick={() => setSheet('sort')} aria-haspopup="dialog">
          {sortLabel}
        </Chip>
        <Chip icon={<IconFilter size={16} />} active={activeCount > 0} onClick={openFilters} aria-haspopup="dialog">
          فیلترها
          {activeCount ? <span className="rounded-full bg-primary px-1.5 text-[11px] text-primary-on">{faDigits(activeCount)}</span> : null}
        </Chip>
        <span className="ms-auto shrink-0 text-xs text-text-muted">{faDigits(meta.total)} کالا</span>
      </div>

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
        <div className="mt-3 flex items-center gap-2 overflow-x-auto scrollbar-none lg:flex-wrap">
          {meta.applied.map((p) => (
            <FilterPill key={`${p.facet}:${p.value}`} label={pillLabel(p, meta)} onRemove={() => removePill(p.facet, p.value)} />
          ))}
          <button type="button" onClick={() => go(clearFilters(state))} className="shrink-0 px-2 text-xs font-medium text-danger">
            حذف همه
          </button>
        </div>
      ) : null}

      <BottomSheet open={sheet === 'sort'} onClose={() => setSheet(null)} title="مرتب‌سازی بر اساس">
        <ul className="py-2" role="radiogroup" aria-label="مرتب‌سازی">
          {meta.sorts.map((s) => (
            <li key={s.value}>
              <button
                type="button"
                role="radio"
                aria-checked={s.value === state.sort}
                onClick={() => {
                  setSheet(null);
                  go({ ...state, sort: s.value as SortKey });
                }}
                className={cx(
                  'flex h-12 w-full items-center justify-between px-4 text-sm',
                  s.value === state.sort ? 'font-bold text-primary' : 'text-text',
                )}
              >
                {s.label}
                <span
                  className={cx('size-5 rounded-full border-2', s.value === state.sort ? 'border-[6px] border-primary' : 'border-border-strong')}
                  aria-hidden="true"
                />
              </button>
            </li>
          ))}
        </ul>
      </BottomSheet>

      <BottomSheet
        open={sheet === 'filter'}
        onClose={() => setSheet(null)}
        title="فیلترها"
        footer={
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setSheet(null);
                go(draft);
              }}
              className="h-12 flex-1 rounded-sm bg-primary text-sm font-bold text-primary-on hover:bg-primary-hover"
            >
              مشاهده نتایج
            </button>
            {hasActiveFilters(draft) ? (
              <button type="button" onClick={() => setDraft(clearFilters(draft))} className="h-12 rounded-sm px-4 text-sm font-medium text-danger">
                حذف فیلترها
              </button>
            ) : null}
          </div>
        }
      >
        <FilterPanel meta={meta} state={draft} onChange={setDraft} />
      </BottomSheet>
    </div>
  );
}

export function FilterSidebar({ meta, state, basePath }: { meta: ListingMeta; state: ListingState; basePath: string }) {
  const { go, pending } = useListingNavigation(basePath);
  return (
    <aside aria-label="فیلترها" className={cx('hidden lg:block', pending && 'opacity-60')}>
      <div className="sticky top-[calc(var(--header-height)+56px)] max-h-[calc(100dvh-var(--header-height)-72px)] overflow-y-auto rounded-md border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-base font-bold text-text">فیلترها</h2>
          {hasActiveFilters(state) ? (
            <button type="button" onClick={() => go(clearFilters(state))} className="text-xs font-medium text-danger">
              حذف همه
            </button>
          ) : null}
        </div>
        <FilterPanel meta={meta} state={state} onChange={go} instant />
      </div>
    </aside>
  );
}

function pillLabel(p: ListingMeta['applied'][number], meta: ListingMeta): string {
  if (p.facet !== 'price') return p.label;
  const fmt = (rial: number | null) => (rial === null ? null : faDigits(Math.round(rial / 10)));
  const lo = fmt(meta.price.selected_min);
  const hi = fmt(meta.price.selected_max);
  if (lo && hi) return `از ${lo} تا ${hi} تومان`;
  if (lo) return `از ${lo} تومان`;
  return `تا ${hi} تومان`;
}
