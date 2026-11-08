'use client';

import { useState } from 'react';
import { cx, faDigits, IconStar } from '@banovit/ui';
import { me, AccountError } from './client';

/** «امتیاز بدهید!» on a delivered order: one tap = a 1–5 rating (moderated before it shows on the product). */
export function RateProduct({ slug, name }: { slug: string; name: string }) {
  const [value, setValue] = useState(0);
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [msg, setMsg] = useState('');
  const rate = async (n: number) => {
    setValue(n);
    setState('saving');
    try {
      await me('POST', 'reviews', { product_slug: slug, rating: n });
      setState('saved');
    } catch (e) {
      setState('error');
      setMsg(e instanceof AccountError ? e.message : 'ثبت امتیاز انجام نشد.');
    }
  };
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm font-bold text-text">امتیاز بدهید!</p>
      <div role="radiogroup" aria-label={`امتیاز به ${name}`} className="flex flex-row-reverse gap-2" dir="ltr">
        {[5, 4, 3, 2, 1].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${faDigits(n)} ستاره`}
            disabled={state === 'saving'}
            onClick={() => rate(n)}
            className="flex flex-col items-center gap-1 text-xs text-text-muted"
          >
            <IconStar size={26} className={cx(n <= value ? 'fill-rating text-rating' : 'text-text-subtle')} />
            {faDigits(n)}
          </button>
        ))}
      </div>
      <p aria-live="polite" className={cx('w-full text-xs', state === 'error' ? 'text-danger' : 'text-success')}>
        {state === 'saved' ? 'امتیاز شما ثبت شد و پس از بررسی نمایش داده می‌شود.' : state === 'error' ? msg : ''}
      </p>
    </div>
  );
}
