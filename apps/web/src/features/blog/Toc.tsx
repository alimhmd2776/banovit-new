'use client';

import { useEffect, useState } from 'react';
import type { TocItem } from '@banovit/api-client';
import { cx, IconClose, IconPlus } from '@banovit/ui';
import { SidebarHeading } from './Sidebar';

function useActiveHeading(ids: string[]): string | null {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter((e): e is HTMLElement => !!e);
    if (els.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-80px 0px -65% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ids]);
  return active;
}

function TocList({ items, active, onPick }: { items: TocItem[]; active: string | null; onPick?: () => void }) {
  return (
    <ol className="space-y-1">
      {items.map((it) => (
        <li key={it.id}>
          <a
            href={`#${encodeURIComponent(it.id)}`}
            onClick={onPick}
            aria-current={active === it.id ? 'location' : undefined}
            className={cx(
              'block truncate rounded-full px-4 py-2.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-focus',
              it.level === 3 && 'ps-8 text-[13px]',
              active === it.id ? 'bg-text text-surface' : 'text-text hover:bg-surface-muted',
            )}
          >
            {it.text}
          </a>
        </li>
      ))}
    </ol>
  );
}

/**
 * «فهرست مطالب»: floating pill above the bottom nav on mobile that expands
 * into a panel; a sticky sidebar list from lg. Same links in both (in-page anchors).
 */
export function Toc({
  items,
  desktop,
  mobile = true,
  labels,
}: {
  items: TocItem[];
  /** sidebar heading from the panel; null = no desktop TOC */
  desktop: { accent?: string | null; title?: string | null } | null;
  mobile?: boolean;
  labels: { title: string; more: string; less: string; collapse_after_px: number };
}) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const active = useActiveHeading(items.map((i) => i.id));
  if (items.length < 2) return null;

  return (
    <>
      {/* live sidebar: «فهرست مطالب این مقاله», collapsed at 170px with «مشاهده بیشتر» */}
      {desktop ? (
      <nav aria-labelledby="sidebar-toc" className="hidden lg:block">
        <SidebarHeading id="sidebar-toc" accent={desktop.accent ?? ''} rest={desktop.title ?? ''} />
        <div className="rounded-lg border border-border bg-surface p-3">
          <div id="sidebar-toc-list" className={cx('relative', !expanded && items.length > 4 && 'overflow-hidden')} style={!expanded && items.length > 4 ? { maxHeight: labels.collapse_after_px } : undefined}>
            <TocList items={items} active={active} />
            {!expanded && items.length > 4 ? <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-surface" /> : null}
          </div>
          {items.length > 4 ? (
            <button
              type="button"
              onClick={() => setExpanded((x) => !x)}
              aria-expanded={expanded}
              aria-controls="sidebar-toc-list"
              className="mt-2 h-9 w-full rounded-full text-sm font-medium text-primary hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-focus"
            >
              {expanded ? labels.less : labels.more}
            </button>
          ) : null}
        </div>
      </nav>
      ) : null}

      {mobile ? (
      <div className="fixed inset-x-4 bottom-[calc(var(--bottom-nav-height)+env(safe-area-inset-bottom)+12px)] z-sticky lg:hidden">
        {open ? (
          <div
            id="toc-panel"
            role="dialog"
            aria-label={labels.title}
            className="max-h-[70dvh] overflow-y-auto rounded-lg border border-border bg-surface p-3 shadow-lg"
          >
            <div className="mb-2 flex items-center justify-between px-2">
              <p className="text-base font-bold text-text">{labels.title}</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="بستن فهرست مطالب"
                className="inline-flex size-9 items-center justify-center rounded-full border border-border text-text focus-visible:outline-2 focus-visible:outline-focus"
              >
                <IconClose size={18} />
              </button>
            </div>
            <TocList items={items} active={active} onPick={() => setOpen(false)} />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-expanded={false}
            aria-controls="toc-panel"
            className="flex h-14 w-full items-center justify-between rounded-full border border-border bg-surface px-5 text-base font-bold text-text shadow-md focus-visible:outline-2 focus-visible:outline-focus"
          >
            {labels.title}
            <span className="inline-flex size-9 items-center justify-center rounded-full border border-border">
              <IconPlus size={18} />
            </span>
          </button>
        )}
      </div>
      ) : null}
    </>
  );
}
