'use client';

import { useMemo, useState } from 'react';
import type { Facet, ListingMeta } from '@banovit/api-client';
import {
  BottomSheet,
  cx,
  faDigits,
  IconChevronLeft,
  IconSearch,
  RangeSlider,
  rialToToman,
  Switch,
} from '@banovit/ui';
import { clearFilters, hasActiveFilters, toggleValue, type ListingState } from './url-state';

export type FilterView = 'root' | 'price' | string; // string = facet key

/**
 * Mobile «فیلتر نمایش» sheet: a list of filter rows (facet, price, in-stock);
 * each row opens its own view (brand with search, price with from/to boxes and
 * slider, color grid, checkbox list). Edits a draft that «اعمال فیلتر» applies.
 */
export function FilterSheet({
  open,
  initialView,
  meta,
  state,
  onApply,
  onClose,
}: {
  open: boolean;
  initialView: FilterView;
  meta: ListingMeta;
  state: ListingState;
  onApply: (next: ListingState) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(state);
  const [view, setView] = useState<FilterView>(initialView);
  const facet = meta.facets.find((f) => f.key === view);
  const price = priceBounds(meta);

  const title = view === 'root' ? 'فیلتر نمایش' : view === 'price' ? 'محدوده قیمت' : (facet?.label ?? 'فیلتر');

  return (
    <BottomSheet
      tall
      open={open}
      onClose={onClose}
      onBack={view !== 'root' ? () => setView('root') : undefined}
      title={title}
      footer={
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setDraft(clearFilters(draft))}
            disabled={!hasActiveFilters(draft)}
            className="h-12 flex-1 rounded-[14px] bg-surface-muted text-sm font-bold text-text-muted disabled:opacity-60"
          >
            حذف فیلترها
          </button>
          <button type="button" onClick={() => onApply(draft)} className="h-12 flex-1 rounded-[14px] bg-primary text-sm font-bold text-primary-on hover:bg-primary-hover">
            اعمال فیلتر
          </button>
        </div>
      }
    >
      {view === 'root' ? (
        <ul className="divide-y divide-border px-4">
          {meta.facets.map((f) => (
            <li key={f.key}>
              <Row
                label={f.key === 'brand' ? 'برند محصول' : f.label}
                active={(draft.facets[f.key]?.length ?? 0) > 0}
                subtitle={selectedLabels(f, draft)}
                onClick={() => setView(f.key)}
              />
            </li>
          ))}
          {price ? (
            <li>
              <Row
                label="محدوده قیمت"
                active={draft.minToman !== null || draft.maxToman !== null}
                subtitle={
                  draft.minToman !== null || draft.maxToman !== null
                    ? `از ${faDigits(draft.minToman ?? price.min)} تومان تا ${faDigits(draft.maxToman ?? price.max)} تومان`
                    : undefined
                }
                onClick={() => setView('price')}
              />
            </li>
          ) : null}
          <li className="py-1">
            <Switch label="فقط محصولات موجود در انبار" checked={draft.inStock} onChange={(v) => setDraft({ ...draft, inStock: v })} />
          </li>
          {meta.on_sale.count > 0 || draft.onSale ? (
            <li className="py-1">
              <Switch label="فقط محصولات تخفیف‌دار" checked={draft.onSale} onChange={(v) => setDraft({ ...draft, onSale: v })} />
            </li>
          ) : null}
        </ul>
      ) : view === 'price' && price ? (
        <PriceView bounds={price} draft={draft} onChange={setDraft} />
      ) : facet ? (
        facet.type === 'swatch' ? (
          <SwatchView facet={facet} draft={draft} onChange={setDraft} />
        ) : (
          <OptionsView facet={facet} draft={draft} onChange={setDraft} />
        )
      ) : null}
    </BottomSheet>
  );
}

function Row({ label, subtitle, active, onClick }: { label: string; subtitle?: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex min-h-[60px] w-full items-center gap-3 py-3 text-start">
      <span className="flex flex-1 flex-col">
        <span className="flex items-center gap-1.5 text-sm font-bold text-text">
          {label}
          {active ? <span className="size-1.5 rounded-full bg-primary" aria-label="فعال" /> : null}
        </span>
        {subtitle ? <span className="mt-1 line-clamp-1 text-[11px] text-text-muted">{subtitle}</span> : null}
      </span>
      <IconChevronLeft size={18} className="text-text-subtle" />
    </button>
  );
}

function OptionsView({ facet, draft, onChange }: { facet: Facet; draft: ListingState; onChange: (s: ListingState) => void }) {
  const [query, setQuery] = useState('');
  const selected = draft.facets[facet.key] ?? [];
  const options = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? facet.options.filter((o) => o.label.includes(q) || o.value.includes(q)) : facet.options;
  }, [facet.options, query]);
  const labelOf = (v: string) => facet.options.find((o) => o.value === v)?.label ?? v;

  return (
    <div className="px-4 pb-2">
      {facet.searchable ? (
        <div className="sticky top-0 z-[1] bg-surface pb-2 pt-3">
          <div className="relative">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={facet.key === 'brand' ? 'جستجو برند…' : `جستجوی ${facet.label}`}
              aria-label={`جستجوی ${facet.label}`}
              data-autofocus
              className="h-12 w-full rounded-full bg-surface-muted pe-11 ps-4 text-sm focus:outline-2 focus:outline-focus"
            />
            <IconSearch size={20} className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 text-text-muted" />
          </div>
          {selected.length ? (
            <div className="mt-3">
              <p className="mb-2 text-xs font-bold text-text">انتخابی‌های شما</p>
              <div className="flex flex-wrap gap-2">
                {selected.map((v) => (
                  <SelectedChip key={v} label={labelOf(v)} onRemove={() => onChange(toggleValue(draft, facet.key, v))} />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
      <ul className="divide-y divide-border">
        {options.map((o) => (
          <li key={o.value}>
            <label className="flex min-h-[60px] cursor-pointer items-center gap-3 text-sm text-text">
              <input
                type="checkbox"
                checked={selected.includes(o.value)}
                onChange={() => onChange(toggleValue(draft, facet.key, o.value))}
                className="size-5 shrink-0 accent-[var(--color-primary)]"
              />
              <span className="flex-1 font-bold">{o.label}</span>
              {facet.key === 'brand' && /^[a-z0-9-]+$/.test(o.value) ? (
                <span className="text-xs capitalize text-text-subtle" dir="ltr">
                  {o.value.replace(/-/g, ' ')}
                </span>
              ) : null}
              <span className="min-w-7 rounded-xs bg-surface-muted px-1.5 text-center text-[11px] leading-5 text-text-muted">{faDigits(o.count)}</span>
            </label>
          </li>
        ))}
        {options.length === 0 ? <li className="py-6 text-center text-sm text-text-subtle">موردی پیدا نشد.</li> : null}
      </ul>
    </div>
  );
}

function SwatchView({ facet, draft, onChange }: { facet: Facet; draft: ListingState; onChange: (s: ListingState) => void }) {
  const selected = draft.facets[facet.key] ?? [];
  const labelOf = (v: string) => facet.options.find((o) => o.value === v)?.label ?? v;
  return (
    <div className="px-4">
      {selected.length ? (
        <div className="pt-3">
          <p className="mb-2 text-xs font-bold text-text">انتخابی‌های شما</p>
          <div className="flex flex-wrap gap-2">
            {selected.map((v) => (
              <SelectedChip key={v} label={labelOf(v)} onRemove={() => onChange(toggleValue(draft, facet.key, v))} />
            ))}
          </div>
        </div>
      ) : null}
      <ul className="grid grid-cols-4 gap-x-2 gap-y-5 py-4">
      {facet.options.map((o) => {
        const on = selected.includes(o.value);
        return (
          <li key={o.value}>
            <button
              type="button"
              aria-pressed={on}
              onClick={() => onChange(toggleValue(draft, facet.key, o.value))}
              className="flex w-full flex-col items-center gap-1.5"
            >
              <span className={cx('flex size-[68px] items-center justify-center rounded-full p-1', on ? 'ring-[1.5px] ring-primary' : 'ring-1 ring-border')}>
                <span className="size-full rounded-full ring-1 ring-border" style={{ backgroundImage: swatchGradient(o.hex) }} />
              </span>
              <span className={cx('line-clamp-1 text-[13px] font-bold', on ? 'text-primary' : 'text-text')}>{o.label}</span>
            </button>
          </li>
        );
      })}
      </ul>
    </div>
  );
}

/** Striped swatch like the design: the color in four bands, darkest first. */
function swatchGradient(hex: string | null | undefined): string {
  if (!hex) return 'var(--swatch-unknown)';
  const mix = (p: number) => `color-mix(in srgb, ${hex} ${p}%, white)`;
  return `linear-gradient(90deg, ${hex} 0 25%, ${mix(80)} 25% 50%, ${mix(62)} 50% 75%, ${mix(45)} 75%)`;
}

function SelectedChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      aria-label={`حذف ${label}`}
      className="inline-flex h-8 items-center rounded-full border border-[var(--brand-100)] bg-primary-subtle px-3 text-xs font-bold text-primary"
    >
      {label}
    </button>
  );
}

function PriceView({ bounds, draft, onChange }: { bounds: { min: number; max: number; step: number }; draft: ListingState; onChange: (s: ListingState) => void }) {
  const lo = draft.minToman ?? bounds.min;
  const hi = draft.maxToman ?? bounds.max;
  const commit = ([a, b]: [number, number]) =>
    onChange({ ...draft, minToman: a > bounds.min ? a : null, maxToman: b < bounds.max ? b : null });

  const box = (label: string, value: number, onValue: (n: number) => void) => (
    <label className="flex flex-1 flex-col gap-1 rounded-[14px] bg-surface-muted px-3 py-2.5">
      <span className="text-[11px] text-text-muted">{label}</span>
      <span className="flex items-baseline gap-1">
        <input
          inputMode="numeric"
          dir="ltr"
          value={faDigits(value)}
          onChange={(e) => {
            const n = Number(e.target.value.replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/\D/g, ''));
            if (Number.isFinite(n)) onValue(n);
          }}
          className="w-full bg-transparent text-end text-base font-bold text-text focus:outline-none"
        />
        <span className="text-sm font-bold text-text">تومان</span>
      </span>
    </label>
  );

  return (
    <div className="space-y-6 p-4">
      <div className="flex gap-2">
        {box('مبلغ از', lo, (n) => commit([Math.min(Math.max(n, bounds.min), hi), hi]))}
        {box('مبلغ تا', hi, (n) => commit([lo, Math.max(Math.min(n, bounds.max), lo)]))}
      </div>
      <RangeSlider min={bounds.min} max={bounds.max} step={bounds.step} value={[lo, hi]} onChange={commit} formatValue={(n) => faDigits(n)} />
      <div className="flex justify-between px-1" aria-hidden="true">
        {Array.from({ length: 11 }, (_, i) => (
          <span key={i} className={cx('w-px bg-border-strong', i % 5 === 0 ? 'h-3' : 'h-1.5')} />
        ))}
      </div>
    </div>
  );
}

function selectedLabels(facet: Facet, draft: ListingState): string | undefined {
  const sel = draft.facets[facet.key];
  if (!sel?.length) return undefined;
  return sel.map((v) => facet.options.find((o) => o.value === v)?.label ?? v).join('، ');
}

export function priceBounds(meta: ListingMeta): { min: number; max: number; step: number } | null {
  if (meta.price.min === null || meta.price.max === null) return null;
  const min = Math.floor(rialToToman(meta.price.min));
  const max = Math.ceil(rialToToman(meta.price.max));
  if (max <= min) return null;
  const raw = (max - min) / 100;
  const mag = 10 ** Math.floor(Math.log10(Math.max(raw, 1)));
  return { min, max, step: Math.max(1, Math.ceil(raw / mag) * mag) };
}
