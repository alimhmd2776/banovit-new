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
