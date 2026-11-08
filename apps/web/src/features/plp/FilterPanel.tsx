'use client';

import { useMemo, useState } from 'react';
import type { Facet, ListingMeta } from '@banovit/api-client';
import { Checkbox, cx, faDigits, IconChevronDown, IconSearch, RangeSlider, rialToToman, Switch } from '@banovit/ui';
import { toggleValue, type ListingState } from './url-state';

const COLLAPSED_OPTIONS = 6;

/**
 * Facet controls shared by the mobile filter sheet (edits a draft, applied by
 * the sheet's button) and the desktop sidebar (each change applies at once).
 */
export function FilterPanel({
  meta,
  state,
  onChange,
  instant = false,
}: {
  meta: ListingMeta;
  state: ListingState;
  onChange: (next: ListingState) => void;
  instant?: boolean;
}) {
  return (
    <div className="divide-y divide-border">
      <section className="px-4 py-2">
        <Switch
          label="فقط کالاهای موجود"
          description={`${faDigits(meta.in_stock.count)} کالا`}
          checked={state.inStock}
          onChange={(v) => onChange({ ...state, inStock: v })}
        />
        {meta.on_sale.count > 0 || state.onSale ? (
          <Switch label="فقط تخفیف‌دارها" checked={state.onSale} onChange={(v) => onChange({ ...state, onSale: v })} />
        ) : null}
      </section>

      {meta.facets.map((facet) => (
        <FacetSection key={facet.key} facet={facet} state={state} onChange={onChange} />
      ))}

      <PriceSection meta={meta} state={state} onChange={onChange} instant={instant} />
    </div>
  );
}

function FacetSection({ facet, state, onChange }: { facet: Facet; state: ListingState; onChange: (s: ListingState) => void }) {
  const [open, setOpen] = useState(true);
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(false);
  const selectedCount = state.facets[facet.key]?.length ?? 0;

  const options = useMemo(() => {
    const q = query.trim();
    const list = q ? facet.options.filter((o) => o.label.includes(q) || o.value.includes(q.toLowerCase())) : facet.options;
    // Selected first so they stay visible when the list is collapsed.
    return [...list].sort((a, b) => Number(b.selected) - Number(a.selected));
  }, [facet.options, query]);

  const visible = expanded || query ? options : options.slice(0, COLLAPSED_OPTIONS);
  const panelId = `facet-${facet.key}`;

  return (
    <section className="px-4 py-3">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen(!open)}
          className="flex w-full items-center justify-between py-1 text-sm font-bold text-text"
        >
          <span>
            {facet.label}
            {selectedCount ? <span className="ms-2 rounded-full bg-primary px-1.5 text-[11px] text-primary-on">{faDigits(selectedCount)}</span> : null}
          </span>
          <IconChevronDown size={18} className={cx('text-text-muted transition-transform', open && 'rotate-180')} />
        </button>
      </h3>
      <div id={panelId} hidden={!open} className="mt-2">
        {facet.searchable && facet.options.length > COLLAPSED_OPTIONS ? (
          <div className="relative mb-2">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`جستجوی ${facet.label}`}
              aria-label={`جستجوی ${facet.label}`}
              className="h-10 w-full rounded-sm border border-border bg-surface-muted ps-9 pe-3 text-sm focus:border-primary focus:bg-surface focus:outline-none"
            />
            <IconSearch size={16} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-text-subtle" />
          </div>
        ) : null}

        {facet.type === 'swatch' ? (
          <ul className="flex flex-wrap gap-2">
            {visible.map((o) => (
              <li key={o.value}>
                <button
                  type="button"
                  aria-pressed={o.selected}
                  onClick={() => onChange(toggleValue(state, facet.key, o.value))}
                  className={cx(
                    'flex items-center gap-2 rounded-full border py-1 ps-1 pe-3 text-xs',
                    o.selected ? 'border-primary bg-primary-subtle text-primary-on-subtle' : 'border-border text-text',
                  )}
                >
                  <span className="size-6 rounded-full border border-border-strong" style={{ backgroundColor: o.hex ?? 'transparent' }} aria-hidden="true" />
                  {o.label}
                  <span className="text-text-subtle">{faDigits(o.count)}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <ul>
            {visible.map((o) => (
              <li key={o.value}>
                <Checkbox
                  checked={o.selected}
                  label={o.label}
                  count={o.count}
                  onChange={() => onChange(toggleValue(state, facet.key, o.value))}
                />
              </li>
            ))}
            {visible.length === 0 ? <li className="py-2 text-sm text-text-subtle">موردی پیدا نشد.</li> : null}
          </ul>
        )}

        {!query && options.length > COLLAPSED_OPTIONS ? (
          <button type="button" onClick={() => setExpanded(!expanded)} className="mt-1 text-sm font-medium text-primary">
            {expanded ? 'نمایش کمتر' : `نمایش همه (${faDigits(options.length)})`}
          </button>
        ) : null}
      </div>
    </section>
  );
}

function PriceSection({
  meta,
  state,
  onChange,
  instant,
}: {
  meta: ListingMeta;
  state: ListingState;
  onChange: (s: ListingState) => void;
  instant: boolean;
}) {
  const min = meta.price.min !== null ? Math.floor(rialToToman(meta.price.min)) : null;
  const max = meta.price.max !== null ? Math.ceil(rialToToman(meta.price.max)) : null;
  const step = max !== null && min !== null ? niceStep(max - min) : 1;
  const [range, setRange] = useState<[number, number]>([state.minToman ?? min ?? 0, state.maxToman ?? max ?? 0]);

  if (min === null || max === null || max <= min) return null;

  const commit = (r: [number, number]) =>
    onChange({ ...state, minToman: r[0] > min ? r[0] : null, maxToman: r[1] < max ? r[1] : null });

  return (
    <section className="px-4 py-4">
      <h3 className="mb-4 text-sm font-bold text-text">محدوده قیمت (تومان)</h3>
      <RangeSlider
        min={min}
        max={max}
        step={step}
        value={range}
        onChange={(r) => {
          setRange(r);
          if (!instant) commit(r);
        }}
        formatValue={(n) => faDigits(n)}
      />
      {instant ? (
        <button
          type="button"
          onClick={() => commit(range)}
          className="mt-4 h-10 w-full rounded-sm border border-primary text-sm font-medium text-primary hover:bg-primary-subtle"
        >
          اعمال قیمت
        </button>
      ) : null}
    </section>
  );
}

/** Slider step that keeps ~100 positions and lands on round toman values. */
function niceStep(span: number): number {
  const raw = span / 100;
  const mag = 10 ** Math.floor(Math.log10(Math.max(raw, 1)));
  return Math.max(1, Math.ceil(raw / mag) * mag);
}
