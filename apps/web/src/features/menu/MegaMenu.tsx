'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import type { MenuItem } from '@banovit/api-client';
import { cx, IconMenu } from '@banovit/ui';
import { countLabel, groupsOf } from './menu-model';
import { CategoryThumb, MenuLink } from './parts';

/**
 * Desktop «دسته بندی کالاها» mega menu (designs/menu/01): opens on hover or
 * click, top categories on the right, the hovered one's groups in a 4-column
 * grid. Every link is in the server HTML (rendered hidden), so crawlers see
 * the whole category tree like the live site.
 */
export function MegaMenu({ items }: { items: MenuItem[] }) {
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<number | null>(items[0]?.id ?? null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const show = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  }, []);
  const hideSoon = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  }, []);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onDown = (e: MouseEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDown);
    };
  }, [open]);

  if (!items.length) return null;
  const active = items.find((i) => i.id === activeId) ?? items[0]!;

  return (
    <div ref={root} className="static" onMouseLeave={hideSoon} onMouseEnter={open ? show : undefined}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={show}
        onMouseEnter={show}
        className="flex h-11 items-center gap-2 text-sm font-medium text-primary hover:text-primary-hover"
      >
        <IconMenu size={20} />
        دسته بندی کالاها
      </button>

      {open ? <div className="pointer-events-none absolute inset-x-0 top-full h-dvh animate-[fadeIn_150ms_ease-out] bg-overlay" aria-hidden="true" /> : null}

      <div
        id={panelId}
        hidden={!open}
        onMouseEnter={show}
        className="absolute inset-x-0 top-full z-modal mx-auto max-w-container animate-[megaIn_150ms_ease-out] px-4"
      >
        <div className="flex max-h-[min(70vh,560px)] overflow-hidden rounded-b-lg border border-t-0 border-border bg-surface shadow-lg">
          <ul className="w-72 shrink-0 space-y-1 overflow-y-auto border-e border-border p-4" role="list">
            {items.map((top) => (
              <li key={top.id}>
                <MenuLink
                  href={top.url}
                  onMouseEnter={() => setActiveId(top.id)}
                  onFocus={() => setActiveId(top.id)}
                  className={cx(
                    'flex items-center gap-3 rounded-md px-3 py-2.5 focus-visible:outline-2 focus-visible:outline-focus',
                    top.id === active.id ? 'bg-surface-muted' : 'hover:bg-surface-muted',
                  )}
                >
                  <CategoryThumb item={top} size={48} className={top.id === active.id ? 'bg-surface' : undefined} />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-text">{top.title}</span>
                    {countLabel(top.product_count) ? (
                      <span className="mt-0.5 block text-xs text-text-subtle">{countLabel(top.product_count)}</span>
                    ) : null}
                  </span>
                </MenuLink>
              </li>
            ))}
          </ul>
          {items.map((top) => (
            <div key={top.id} hidden={top.id !== active.id} className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-4 gap-x-6 gap-y-4">
                {groupsOf(top).map((g) => (
                  <section key={g.id} aria-label={g.title}>
                    <div className="flex items-center justify-between rounded-sm bg-surface-muted px-3 py-2 text-sm">
                      <h3 className="truncate text-text-muted">{g.title}</h3>
                      <MenuLink href={g.url} className="shrink-0 font-medium text-primary hover:underline">
                        مشاهده همه
                      </MenuLink>
                    </div>
                    <ul className="divide-y divide-border px-2">
                      {g.items.map((s) => (
                        <li key={s.id}>
                          <MenuLink href={s.url} className="block py-3 hover:text-primary focus-visible:outline-2 focus-visible:outline-focus">
                            <span className="block text-sm font-medium text-text">{s.title}</span>
                            {countLabel(s.product_count) ? (
                              <span className="mt-1 block text-xs text-text-subtle">{countLabel(s.product_count)}</span>
                            ) : null}
                          </MenuLink>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
              {top.children.length === 0 ? (
                <MenuLink href={top.url} className="text-sm font-medium text-primary hover:underline">
                  مشاهده همه {top.title}
                </MenuLink>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
