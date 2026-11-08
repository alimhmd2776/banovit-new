/**
 * Standard GA4 ecommerce events into window.dataLayer (GTM/Matomo pick them
 * up like on the live site). Pages call these helpers, never gtag directly
 * (docs/05-conventions.md). Values are toman, like the live tags.
 */
type Item = { item_id: string | number; item_name: string; item_brand?: string; item_variant?: string; price: number; quantity: number };

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function track(event: string, ecommerce: { currency?: string; value?: number; items?: Item[]; [k: string]: unknown }) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ ecommerce: null });
  window.dataLayer.push({ event, ecommerce: { currency: 'IRT', ...ecommerce } });
}

export type { Item as AnalyticsItem };
