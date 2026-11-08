'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Money, ProductAddon, ProductLive, ProductOption, ProductVariant } from '@banovit/api-client';
import { addToCart, type CartError } from './cart';
import { trackEcommerce } from '@/lib/analytics';
import { choose, initialSelection, matchVariant, selectionQuery, type Selection } from './variants';

/** The slice of ProductDetail the purchase controls need (keeps the client payload small). */
export type PurchaseProduct = {
  id: number;
  slug: string;
  name: string;
  path: string;
  brand: string | null;
  category: string | null;
  type: 'simple' | 'variable';
  price: Money | null;
  price_max: Money | null;
  regular_price: Money | null;
  discount_percent: number;
  in_stock: boolean;
  options: ProductOption[];
  variants: ProductVariant[];
  addons: ProductAddon[];
};

type Status = { kind: 'idle' } | { kind: 'adding' } | { kind: 'added' } | { kind: 'error'; message: string };

type Ctx = {
  product: PurchaseProduct;
  selection: Selection;
  select: (key: string, value: string) => void;
  variant: ProductVariant | null;
  /** Price/stock of what would go into the cart now (variant, or the product). */
  current: { price: Money | null; regular: Money | null; discount: number; inStock: boolean; fromPrice: boolean };
  addonIds: number[];
  toggleAddon: (addonId: number, optionId: number) => void;
  addonTotal: number;
  quantity: number;
  setQuantity: (n: number) => void;
  status: Status;
  add: () => Promise<void>;
  /** Which option is missing when the shopper presses add too early. */
  missing: string | null;
};

const PurchaseCtx = createContext<Ctx | null>(null);

export function usePurchase(): Ctx {
  const ctx = useContext(PurchaseCtx);
  if (!ctx) throw new Error('usePurchase outside PurchaseProvider');
  return ctx;
}

function withLive(p: PurchaseProduct, live: ProductLive | null): PurchaseProduct {
  if (!live || live.id !== p.id) return p;
  const byId = new Map(live.variants.map((v) => [v.id, v]));
  return {
    ...p,
    price: live.price,
    price_max: live.price_max,
    regular_price: live.regular_price,
    discount_percent: live.discount_percent,
    in_stock: live.in_stock,
    variants: p.variants.map((v) => ({ ...v, ...(byId.get(v.id) ?? {}) })),
  };
}

export function PurchaseProvider({ product: initial, children }: { product: PurchaseProduct; children: ReactNode }) {
  const [live, setLive] = useState<ProductLive | null>(null);
  const product = useMemo(() => withLive(initial, live), [initial, live]);
  // Server render uses the default (cheapest in-stock) selection so the HTML is cacheable;
  // ?attribute_pa_x= links are applied after hydration.
  const [selection, setSelection] = useState<Selection>(() => initialSelection(initial.options, initial.variants));
  const [addonIds, setAddonIds] = useState<number[]>(() =>
    initial.addons.flatMap((a) => a.options.filter((o) => o.default).map((o) => o.id)),
  );
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [missing, setMissing] = useState<string | null>(null);

  useEffect(() => {
    const params = Object.fromEntries(new URLSearchParams(window.location.search));
    if (Object.keys(params).some((k) => k.startsWith('attribute_'))) {
      setSelection(initialSelection(initial.options, initial.variants, params));
    }
    // Cached HTML may be minutes old: refresh price and stock.
    const ctrl = new AbortController();
    fetch(`/api/products/${encodeURIComponent(initial.slug)}/live/`, { signal: ctrl.signal })
      .then((r) => (r.ok ? (r.json() as Promise<{ data: ProductLive }>) : null))
      .then((body) => body && setLive(body.data))
      .catch(() => undefined);
    trackEcommerce('view_item', { currency: 'IRR', value: initial.price?.amount ?? 0, items: [gaItem(initial, null, 1)] });
    // Recently viewed (account thread's BFF; guests get 401, ignored).
    fetch('/api/me/recently-viewed/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ product_slug: initial.slug }),
    }).catch(() => undefined);
    return () => ctrl.abort();
  }, [initial]);

  const variant = useMemo(
    () => (product.type === 'variable' ? matchVariant(product.options, product.variants, selection) : null),
    [product, selection],
  );

  const select = useCallback(
    (key: string, value: string) => {
      setMissing(null);
      setStatus({ kind: 'idle' });
      setSelection((sel) => {
        const next = choose(product.options, product.variants, sel, key, value);
        // Shareable URL for the chosen variant; canonical stays the clean product URL.
        window.history.replaceState(null, '', `${window.location.pathname}${selectionQuery(next)}${window.location.hash}`);
        return next;
      });
    },
    [product],
  );

  const toggleAddon = useCallback(
    (addonId: number, optionId: number) => {
      const addon = product.addons.find((a) => a.id === addonId);
      if (!addon) return;
      setStatus({ kind: 'idle' });
      setAddonIds((ids) => {
        const has = ids.includes(optionId);
        if (addon.type === 'radio') {
          const others = ids.filter((id) => !addon.options.some((o) => o.id === id));
          return has && !addon.required ? others : [...others, optionId];
        }
        return has ? ids.filter((id) => id !== optionId) : [...ids, optionId];
      });
    },
    [product.addons],
  );

  const addonTotal = useMemo(
    () => product.addons.flatMap((a) => a.options).filter((o) => addonIds.includes(o.id)).reduce((s, o) => s + o.price.amount, 0),
    [product.addons, addonIds],
  );

  const current = useMemo(() => {
    if (product.type === 'variable') {
      if (variant) return { price: variant.price, regular: variant.regular_price, discount: variant.discount_percent, inStock: variant.in_stock, fromPrice: false };
      return { price: product.price, regular: product.regular_price, discount: product.discount_percent, inStock: product.in_stock, fromPrice: !!product.price_max };
    }
    return { price: product.price, regular: product.regular_price, discount: product.discount_percent, inStock: product.in_stock, fromPrice: false };
  }, [product, variant]);

  const add = useCallback(async () => {
    if (product.type === 'variable' && !variant) {
      const first = product.options.find((o) => !selection[o.key]);
      setMissing(first?.key ?? product.options[0]?.key ?? null);
      document.getElementById(`option-${first?.key ?? product.options[0]?.key}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setStatus({ kind: 'error', message: first ? `${first.label} را انتخاب کنید.` : 'این ترکیب موجود نیست؛ گزینه دیگری انتخاب کنید.' });
      return;
    }
    const required = product.addons.find((a) => a.required && !a.options.some((o) => addonIds.includes(o.id)));
    if (required) {
      setStatus({ kind: 'error', message: `«${required.title}» را انتخاب کنید.` });
      return;
    }
    setStatus({ kind: 'adding' });
    try {
      await addToCart({
        product_id: product.id,
        variation_id: variant?.id ?? null,
        quantity,
        addon_ids: addonIds,
        installation: product.addons.some((a) => a.options.some((o) => o.kind === 'installation' && addonIds.includes(o.id))),
      });
      setStatus({ kind: 'added' });
      trackEcommerce('add_to_cart', {
        currency: 'IRR',
        value: ((current.price?.amount ?? 0) + addonTotal) * quantity,
        items: [gaItem(product, variant, quantity)],
      });
    } catch (e) {
      setStatus({ kind: 'error', message: (e as CartError).message ?? 'افزودن به سبد انجام نشد. دوباره تلاش کنید.' });
    }
  }, [product, variant, selection, quantity, addonIds, current.price, addonTotal]);

  const value: Ctx = { product, selection, select, variant, current, addonIds, toggleAddon, addonTotal, quantity, setQuantity, status, add, missing };
  return <PurchaseCtx.Provider value={value}>{children}</PurchaseCtx.Provider>;
}

function gaItem(p: PurchaseProduct, v: ProductVariant | null, quantity: number) {
  return {
    item_id: String(v?.sku ?? v?.id ?? p.id),
    item_name: p.name,
    item_brand: p.brand ?? undefined,
    item_category: p.category ?? undefined,
    item_variant: v ? Object.values(v.attributes).filter(Boolean).join(' / ') : undefined,
    price: (v?.price ?? p.price)?.amount ?? 0,
    quantity,
  };
}
