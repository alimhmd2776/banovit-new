'use client';

import { useState } from 'react';
import { cx, IconChevronLeft } from '@banovit/ui';

/**
 * «معرفی محصول»: the full HTML is always rendered (crawlable); only its height
 * is clamped until the shopper expands it.
 */
export function ExpandableHtml({ html, moreLabel = 'مشاهده ادامه معرفی' }: { html: string; moreLabel?: string }) {
  const [open, setOpen] = useState(false);
  const long = html.replace(/<[^>]+>/g, '').length > 450;
  return (
    <div>
      <div
        className={cx(
          'prose-pdp relative text-sm leading-7 text-text-muted',
          long && !open && 'max-h-40 overflow-hidden [mask-image:linear-gradient(to_bottom,black_55%,transparent)]',
        )}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {long ? (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="mx-auto mt-3 flex items-center gap-1 text-sm font-medium text-text-muted hover:text-primary"
        >
          {open ? 'بستن' : moreLabel}
          <IconChevronLeft size={16} className={cx('transition-transform', open && '-rotate-90')} />
        </button>
      ) : null}
    </div>
  );
}
