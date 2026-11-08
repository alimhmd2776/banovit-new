'use client';

import { useState } from 'react';
import { cx } from '@banovit/ui';

/** Three-line clamp with «مشاهده بیشتر»; the full text is always in the HTML. */
export function ExpandableText({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const long = text.length > 160;
  return (
    <div>
      <p className={cx('whitespace-pre-line text-sm leading-7 text-text-muted', long && !open && 'line-clamp-3')}>{text}</p>
      {long ? (
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="mt-1 text-sm font-medium text-primary underline-offset-4 hover:underline">
          {open ? 'بستن' : 'مشاهده بیشتر'}
        </button>
      ) : null}
    </div>
  );
}
