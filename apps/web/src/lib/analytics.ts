/**
 * Standard GA4 ecommerce events into the dataLayer (GTM and Matomo read it,
 * like the live site). Pages never call gtag directly (docs/05-conventions.md).
 */
type DataLayerWindow = Window & { dataLayer?: Record<string, unknown>[] };

export function trackEcommerce(event: 'view_item' | 'add_to_cart' | 'select_item' | 'view_item_list', ecommerce: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  const w = window as DataLayerWindow;
  w.dataLayer = w.dataLayer ?? [];
  w.dataLayer.push({ ecommerce: null }); // clear the previous ecommerce object (GA4 recommendation)
  w.dataLayer.push({ event, ecommerce });
}

/* ---- cart & checkout (feature/web-cart): begin_checkout, add_shipping_info, add_payment_info, purchase, remove_from_cart ... ---- */
type Item = { item_id: string | number; item_name: string; item_brand?: string; item_variant?: string; price: number; quantity: number };

/** Any GA4 ecommerce event; values are toman (currency IRT), like the live tags. */
export function track(event: string, ecommerce: { currency?: string; value?: number; items?: Item[]; [k: string]: unknown }): void {
  if (typeof window === 'undefined') return;
  const w = window as DataLayerWindow;
  w.dataLayer = w.dataLayer ?? [];
  w.dataLayer.push({ ecommerce: null });
  w.dataLayer.push({ event, ecommerce: { currency: 'IRT', ...ecommerce } });
}

export type { Item as AnalyticsItem };
