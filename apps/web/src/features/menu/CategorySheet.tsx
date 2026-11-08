'use client';

import { useCallback, useDeferredValue, useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { MenuItem } from '@banovit/api-client';
import { IconChevronLeft, IconChevronRight, IconClose, IconSearch } from '@banovit/ui';
import { countLabel, groupsOf, searchMenu } from './menu-model';
import { CategoryThumb, MenuLink } from './parts';
import { useModal } from './useModal';
import { DEFAULT_TEXTS, fill, type HeaderTexts } from './header-texts';


/**
 * «دسته‌بندی محصولات» bottom sheet (designs/menu/02-06): top categories,
 * a category's grouped subcategories with an optional promo banner, and a
 * client-side search over the whole tree.
 */
export function CategorySheet({
  items,
  open,
  onClose,
  texts = DEFAULT_TEXTS,
}: {
  items: MenuItem[];
  open: boolean;
  onClose: () => void;
  texts?: HeaderTexts;
}) {
  const titleId = useId();
  const panel = useRef<HTMLDivElement>(null);
  const [topId, setTopId] = useState<number | null>(null);
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    if (!open) {
      setTopId(null);
      setQuery('');
    }
  }, [open]);

  const close = useCallback(() => onClose(), [onClose]);
  useModal(open, panel, close);

  const top = items.find((i) => i.id === topId) ?? null;
  const results = useMemo(() => searchMenu(items, deferredQuery), [items, deferredQuery]);
  const searching = deferredQuery.trim() !== '';

  if (!open || typeof document === 'undefined') return null;

  const title = searching ? fill(texts.sheet_results_title, { query: deferredQuery.trim() }) : (top?.title ?? texts.sheet_title);

  const openTop = (item: MenuItem) => {
    setTopId(item.id);
    setQuery('');
    panel.current?.querySelector('[data-scroll]')?.scrollTo({ top: 0 });
  };

  return createPortal(
    <div className="fixed inset-0 z-drawer flex items-end lg:hidden" role="presentation">
      <div className="absolute inset-0 animate-[fadeIn_150ms_ease-out] bg-overlay" onClick={close} aria-hidden="true" />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex h-[88dvh] w-full animate-[sheetUp_300ms_var(--ease-standard)] flex-col rounded-t-[28px] bg-surface shadow-lg"
      >
        <div className="mx-auto mt-2.5 h-1 w-9 rounded-full bg-border" aria-hidden="true" />
        <header className="grid grid-cols-[44px_1fr_44px] items-center gap-2 px-4 pb-3 pt-3">
          <div>
            {top && !searching ? (
              <button
                type="button"
                onClick={() => setTopId(null)}
                aria-label="بازگشت به همه دسته‌ها"
                className="inline-flex size-11 items-center justify-center rounded-full border border-border text-text hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-focus"
              >
                <IconChevronRight size={22} />
              </button>
            ) : null}
          </div>
          <div className="min-w-0 text-center">
            <h2 id={titleId} className="truncate text-base font-bold text-text">
              {title}
            </h2>
            <p className="mt-0.5 text-xs text-text-subtle">{texts.sheet_subtitle}</p>
          </div>
          <button
            type="button"
            onClick={close}
            data-autofocus
            aria-label="بستن"
            className="inline-flex size-11 items-center justify-center rounded-full border border-border text-text hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-focus"
          >
            <IconClose size={22} />
          </button>
        </header>

        <div className="px-4 pb-2">
          <label htmlFor={`${titleId}-q`} className="sr-only">
            جستجو دسته‌بندی
          </label>
          <div className="relative">
            <input
              id={`${titleId}-q`}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={texts.sheet_search_placeholder}
              autoComplete="off"
              className="h-11 w-full rounded-md bg-surface-muted pe-11 ps-4 text-sm text-text placeholder:text-text-subtle focus:outline-2 focus:outline-focus"
            />
            <IconSearch size={20} className="pointer-events-none absolute end-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          </div>
        </div>

        <div data-scroll className="flex-1 overflow-y-auto overscroll-contain px-4 pb-[max(16px,env(safe-area-inset-bottom))]">
          {searching ? (
            <SearchResults query={deferredQuery.trim()} tops={results.tops} subs={results.subs} onOpenTop={openTop} onNavigate={close} texts={texts} />
          ) : top ? (
            <TopCategory top={top} onNavigate={close} texts={texts} />
          ) : (
            <TopList items={items} onOpenTop={openTop} onNavigate={close} suffix={texts.count_suffix} />
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

function TopRow({ item, onOpenTop, onNavigate, suffix }: { item: MenuItem; onOpenTop: (i: MenuItem) => void; onNavigate: () => void; suffix: string }) {
  const count = countLabel(item.product_count, suffix);
  const inner = (
    <>
      <CategoryThumb item={item} size={48} />
      <span className="min-w-0 flex-1 text-start">
        <span className="block truncate text-sm font-bold text-text">{item.title}</span>
        {count ? <span className="mt-0.5 block text-xs text-text-subtle">{count}</span> : null}
      </span>
      <IconChevronLeft size={20} className="text-text-muted" />
    </>
  );
  const cls = 'flex w-full items-center gap-3 rounded-md py-2 hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-focus';
  return item.children.length ? (
    <button type="button" className={cls} onClick={() => onOpenTop(item)}>
      {inner}
    </button>
  ) : (
    <MenuLink href={item.url} className={cls} onNavigate={onNavigate}>
      {inner}
    </MenuLink>
  );
}

function TopList({ items, onOpenTop, onNavigate, suffix }: { items: MenuItem[]; onOpenTop: (i: MenuItem) => void; onNavigate: () => void; suffix: string }) {
  return (
    <ul className="space-y-1">
      {items.map((item) => (
        <li key={item.id}>
          <TopRow item={item} onOpenTop={onOpenTop} onNavigate={onNavigate} suffix={suffix} />
        </li>
      ))}
    </ul>
  );
}

function SubRows({ items, onNavigate, suffix }: { items: MenuItem[]; onNavigate: () => void; suffix: string }) {
  return (
    <ul className="divide-y divide-border px-2">
      {items.map((s) => {
        const count = countLabel(s.product_count, suffix);
        return (
          <li key={s.id}>
            <MenuLink href={s.url} onNavigate={onNavigate} className="block py-3.5 hover:text-primary focus-visible:outline-2 focus-visible:outline-focus">
              <span className="block text-sm font-bold text-text">{s.title}</span>
              {count ? <span className="mt-1 block text-xs text-text-subtle">{count}</span> : null}
            </MenuLink>
          </li>
        );
      })}
    </ul>
  );
}

function TopCategory({ top, onNavigate, texts }: { top: MenuItem; onNavigate: () => void; texts: HeaderTexts }) {
  const groups = groupsOf(top);
  return (
    <div className="space-y-3 pt-2">
      {groups.map((g) => (
        <section key={g.id} aria-label={g.title}>
          <div className="flex items-center justify-between rounded-sm bg-surface-muted px-3 py-2 text-sm">
            <h3 className="font-medium text-text-muted">{g.title}</h3>
            <MenuLink href={g.url} onNavigate={onNavigate} className="font-bold text-primary hover:underline">
              {texts.sheet_view_all}
            </MenuLink>
          </div>
          <SubRows items={g.items} onNavigate={onNavigate} suffix={texts.count_suffix} />
        </section>
      ))}
      {top.promo?.image_url ? <PromoBanner promo={top.promo} fallbackUrl={top.url} onNavigate={onNavigate} /> : null}
    </div>
  );
}

function PromoBanner({ promo, fallbackUrl, onNavigate }: { promo: NonNullable<MenuItem['promo']>; fallbackUrl: string; onNavigate: () => void }) {
  const hasText = Boolean(promo.title || promo.badge || promo.button_text);
  return (
    <MenuLink
      href={promo.url || fallbackUrl}
      onNavigate={onNavigate}
      className="relative block overflow-hidden rounded-md border border-border"
      aria-label={promo.title || promo.button_text || undefined}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- CMS banner, size unknown */}
      <img src={promo.image_url} alt={promo.title ?? ''} className="block h-auto w-full" loading="lazy" />
      {hasText ? (
        <span className="absolute inset-y-0 start-0 flex w-1/2 flex-col items-start justify-center gap-2 p-3">
          {promo.badge ? <span className="rounded-full bg-primary-subtle px-2 py-0.5 text-[10px] text-primary">{promo.badge}</span> : null}
          {promo.title ? <span className="text-sm font-extrabold text-text">{promo.title}</span> : null}
          {promo.button_text ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs text-primary-on">
              {promo.button_text}
              <IconChevronLeft size={14} />
            </span>
          ) : null}
        </span>
      ) : null}
    </MenuLink>
  );
}

function SearchResults({
  query,
  tops,
  subs,
  onOpenTop,
  onNavigate,
  texts,
}: {
  query: string;
  tops: MenuItem[];
  subs: MenuItem[];
  onOpenTop: (i: MenuItem) => void;
  onNavigate: () => void;
  texts: HeaderTexts;
}) {
  if (!tops.length && !subs.length) {
    return (
      <div className="flex flex-col items-center px-6 pt-10 text-center" role="status">
        {texts.sheet_empty_image ? (
          // eslint-disable-next-line @next/next/no-img-element -- optional illustration from the media library
          <img src={texts.sheet_empty_image} alt="" className="mb-5 h-28 w-auto" />
        ) : null}
        <p className="text-sm font-bold text-text">{fill(texts.sheet_empty_title, { query })}</p>
        <p className="mt-2 text-xs text-text-subtle">{texts.sheet_empty_hint}</p>
      </div>
    );
  }
  return (
    <div className="space-y-2 pt-1" role="status" aria-live="polite">
      {tops.length ? <TopList items={tops} onOpenTop={onOpenTop} onNavigate={onNavigate} suffix={texts.count_suffix} /> : null}
      {subs.length ? (
        <>
          <div className="rounded-sm bg-surface-muted px-3 py-2 text-sm font-medium text-text-muted">{texts.sheet_found_subcategories}</div>
          <SubRows items={subs} onNavigate={onNavigate} suffix={texts.count_suffix} />
        </>
      ) : null}
    </div>
  );
}
