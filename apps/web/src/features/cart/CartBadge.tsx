'use client';

import { useEffect, useState } from 'react';
import { cx, faDigits } from '@banovit/ui';

function readCount(): number {
  const m = typeof document === 'undefined' ? null : document.cookie.match(/(?:^|;\s*)bnv_cart_count=(\d+)/);
  return m ? Number(m[1]) : 0;
}

/**
 * Item-count bubble on the cart icon. Reads the `bnv_cart_count` cookie the
 * BFF keeps in sync (no request) and listens for `cart:updated`.
 */
export function CartBadge({ className }: { className?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    setCount(readCount());
    const onUpdate = (e: Event) => setCount((e as CustomEvent<{ item_count?: number }>).detail?.item_count ?? readCount());
    window.addEventListener('cart:updated', onUpdate);
    return () => window.removeEventListener('cart:updated', onUpdate);
  }, []);
  if (count <= 0) return null;
  return (
    <span
      className={cx(
        'absolute -top-1 end-0 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold leading-none text-primary-on ring-2 ring-surface',
        className,
      )}
    >
      {faDigits(count > 99 ? 99 : count)}
      <span className="sr-only"> کالا در سبد</span>
    </span>
  );
}
