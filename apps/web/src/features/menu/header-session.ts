'use client';

import { useEffect, useState } from 'react';

/**
 * Personal bits of the header, loaded in the browser so header HTML stays
 * cacheable (ISR/CDN): customer name (GET /api/auth/me/), wishlist size
 * (GET /api/me/wishlist/slugs/, only when signed in) and cart item count
 * (bnv_cart_count cookie + `cart:updated` event, same source as CartBadge).
 * One fetch per page load, shared by every component that uses the hook.
 */
export interface HeaderSession {
  /** undefined = still loading; null = guest. */
  name: string | null | undefined;
  signedIn: boolean;
  wishlistCount: number;
  cartCount: number;
}

type Loaded = { name: string | null; signedIn: boolean; wishlistCount: number };

let pending: Promise<Loaded> | null = null;

function load(): Promise<Loaded> {
  pending ??= (async () => {
    try {
      const me = await fetch('/api/auth/me/', { credentials: 'same-origin', cache: 'no-store' });
      const customer = me.ok ? ((await me.json()) as { data: { name: string | null; phone: string } | null }).data : null;
      if (!customer) return { name: null, signedIn: false, wishlistCount: 0 };
      let wishlistCount = 0;
      const wl = await fetch('/api/me/wishlist/slugs/', { credentials: 'same-origin', cache: 'no-store' }).catch(() => null);
      if (wl?.ok) wishlistCount = ((await wl.json()) as { data?: string[] }).data?.length ?? 0;
      return { name: customer.name || customer.phone, signedIn: true, wishlistCount };
    } catch {
      return { name: null, signedIn: false, wishlistCount: 0 };
    }
  })();
  return pending;
}

function readCartCount(): number {
  const m = typeof document === 'undefined' ? null : document.cookie.match(/(?:^|;\s*)bnv_cart_count=(\d+)/);
  return m ? Number(m[1]) : 0;
}

export function useHeaderSession(): HeaderSession {
  const [state, setState] = useState<HeaderSession>({ name: undefined, signedIn: false, wishlistCount: 0, cartCount: 0 });

  useEffect(() => {
    let alive = true;
    setState((s) => ({ ...s, cartCount: readCartCount() }));
    load().then((l) => alive && setState((s) => ({ ...s, ...l })));
    const onCart = (e: Event) =>
      setState((s) => ({ ...s, cartCount: (e as CustomEvent<{ item_count?: number }>).detail?.item_count ?? readCartCount() }));
    const onWishlist = (e: Event) => {
      const n = (e as CustomEvent<{ count?: number }>).detail?.count;
      if (typeof n === 'number') setState((s) => ({ ...s, wishlistCount: n }));
    };
    window.addEventListener('cart:updated', onCart);
    window.addEventListener('wishlist:updated', onWishlist);
    return () => {
      alive = false;
      window.removeEventListener('cart:updated', onCart);
      window.removeEventListener('wishlist:updated', onWishlist);
    };
  }, []);

  return state;
}
