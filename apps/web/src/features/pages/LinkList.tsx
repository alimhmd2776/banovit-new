'use client';

import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import { BottomSheet, IconChevronLeft } from '@banovit/ui';
import { PageIcon } from './icons';
import type { IconName } from './types';

type Item = { icon: IconName | null; title: string; subtitle: string | null; href: string | null; sheet_title: string | null; sheet: ReactNode };

/**
 * Rows that open a sheet («ارسال اتوبوسرانی», «ارسال باربری») or link away.
 * The sheet content is server-rendered and also kept in the HTML inside a
 * hidden region, so crawlers and no-JS readers still get the full text.
 */
export function LinkList({ items }: { items: Item[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const current = open === null ? null : items[open];

  return (
    <>
      <ul className="flex flex-col gap-3 px-4 lg:grid lg:grid-cols-2 lg:px-0">
        {items.map((item, i) => {
          const body = (
            <>
              <span className="shrink-0 text-primary">
                <PageIcon name={item.icon} size={28} />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5 text-start">
                <span className="text-sm font-bold text-text">{item.title}</span>
                {item.subtitle && <span className="text-xs text-text-muted">{item.subtitle}</span>}
              </span>
              <IconChevronLeft size={20} className="shrink-0 text-text-subtle" />
            </>
          );
          const cls =
            'flex w-full items-center gap-3 rounded-md border border-border bg-surface px-4 py-4 hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus';
          return (
            <li key={i}>
              {item.sheet ? (
                <>
                  <button type="button" className={cls} aria-haspopup="dialog" onClick={() => setOpen(i)}>
                    {body}
                  </button>
                  <div hidden data-sheet-source>
                    <h3>{item.sheet_title ?? item.title}</h3>
                    {item.sheet}
                  </div>
                </>
              ) : item.href ? (
                <Link href={item.href} className={cls}>
                  {body}
                </Link>
              ) : (
                <div className={cls}>{body}</div>
              )}
            </li>
          );
        })}
      </ul>
      <BottomSheet open={current !== null} onClose={() => setOpen(null)} title={current?.sheet_title ?? current?.title ?? ''}>
        <div className="flex flex-col gap-5 py-5">{current?.sheet}</div>
      </BottomSheet>
    </>
  );
}
