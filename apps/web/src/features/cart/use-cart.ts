'use client';

import { useCallback, useRef, useState } from 'react';
import type { Cart } from '@banovit/api-client';
import { withProgress } from '@/lib/nav-progress';
import { CartError } from './client';

/**
 * Local cart state for the cart/checkout pages. Mutations are serialized (a
 * fast double tap on «+» never races) and the server's cart always wins, so
 * totals on screen are exactly what the CMS will charge.
 */
export function useCart(initial: Cart) {
  const [cart, setCart] = useState<Cart>(initial);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<CartError | null>(null);
  const queue = useRef<Promise<unknown>>(Promise.resolve());

  const run = useCallback((key: string, op: () => Promise<Cart>): Promise<Cart | null> => {
    const next = queue.current.then(async () => {
      setBusy(key);
      setError(null);
      try {
        const c = await withProgress(op);
        setCart(c);
        return c;
      } catch (e) {
        setError(e instanceof CartError ? e : new CartError(0, 'error', 'خطایی رخ داد. دوباره تلاش کنید.'));
        return null;
      } finally {
        setBusy(null);
      }
    });
    queue.current = next.catch(() => null);
    return next;
  }, []);

  return { cart, setCart, busy, error, setError, run };
}
