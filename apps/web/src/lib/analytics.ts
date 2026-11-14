/**
 * Standard GA4 ecommerce events into the dataLayer (GTM reads it, like the live site).
 * Pages never call gtag directly (docs/05-conventions.md).
 * Values are RIAL with currency IRR, exactly like the live site's dataLayer (banovit-measurement
 * "Currency" rule), so GA4 revenue keeps the same unit after the move.
 *
 * Google Ads: view_item / add_to_cart / begin_checkout also go to Google Ads as secondary
 * conversions in TRY (the Ads account currency), like the old site's «bnv-ads-init»; contact
 * clicks and lead forms as primary ones. Only when TrackingRoot configured Ads (CMS
 * settings/tracking enabled) — on test deploys nothing is sent to Google.
 */
type DataLayerWindow = Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };

export function pushDataLayer(entry: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  const w = window as DataLayerWindow;
  w.dataLayer = w.dataLayer ?? [];
  w.dataLayer.push(entry);
}

/* ---- Google Ads (direct gtag, like the old site) ---- */
type AdsConfig = { id: string; labels: Record<string, string>; tryRateIrr: number | null };
let ads: AdsConfig | null = null;

export function configureAds(config: AdsConfig | null) {
  ads = config;
}

export function adsConversion(name: string, params: Record<string, unknown>): void {
  if (typeof window === 'undefined' || !ads) return;
  const label = ads.labels[name];
  const w = window as DataLayerWindow;
  if (!label || !w.gtag) return;
  try {
    w.gtag('event', 'conversion', { send_to: `${ads.id}/${label}`, ...params });
  } catch {
    /* never break the page */
  }
}

/** IRR → TRY with the CMS fx rate (IRR per TRY), 2 decimals. */
export function irrToTry(irr: number, rate: number | null): number | null {
  if (!rate || rate <= 0) return null;
  return Math.round(((Number(irr) || 0) / rate) * 100) / 100;
}

const ADS_TWINS = new Set(['view_item', 'add_to_cart', 'begin_checkout']);

function adsTwin(event: string, ecommerce: { value?: number }) {
  if (!ads || !ADS_TWINS.has(event)) return;
  const v = irrToTry(ecommerce.value ?? 0, ads.tryRateIrr);
  if (v && v > 0) adsConversion(event, { value: v, currency: 'TRY' });
}

export function trackEcommerce(event: 'view_item' | 'add_to_cart' | 'select_item' | 'view_item_list', ecommerce: Record<string, unknown>): void {
  pushDataLayer({ ecommerce: null }); // clear the previous ecommerce object (GA4 recommendation)
  pushDataLayer({ event, ecommerce });
  adsTwin(event, ecommerce as { value?: number });
}

/* ---- cart & checkout (feature/web-cart): begin_checkout, add_shipping_info, add_payment_info, purchase, remove_from_cart ... ---- */
type Item = { item_id: string | number; item_name: string; item_brand?: string; item_variant?: string; price: number; quantity: number };

/** Any GA4 ecommerce event; amounts are rial (currency IRR), like the live tags. */
export function track(event: string, ecommerce: { currency?: string; value?: number; items?: Item[]; [k: string]: unknown }): void {
  pushDataLayer({ ecommerce: null });
  pushDataLayer({ event, ecommerce: { currency: 'IRR', ...ecommerce } });
  adsTwin(event, ecommerce);
}

/**
 * A lead form was sent (consultation, callback, price calculator): GA4 generate_lead via GTM
 * and the Google Ads «Lead form submit» conversion.
 */
export function trackLead(formId: string, extra: Record<string, unknown> = {}): void {
  pushDataLayer({ event: 'generate_lead', form_id: formId, lead_type: 'b2c', ...extra });
  adsConversion('generate_lead', {});
}

/**
 * Order placed with an offline payment (card to card): not a purchase yet (that is sent server
 * side once the sales team confirms it) — the secondary Ads conversion «order pending», like the old site.
 */
export function trackOrderPending(transactionId: string, valueIrr: number): void {
  const v = ads ? irrToTry(valueIrr, ads.tryRateIrr) : null;
  pushDataLayer({ event: 'ads_order_pending', ads: { transaction_id: transactionId, currency: 'IRR', value: valueIrr } });
  adsConversion('order_pending', { transaction_id: transactionId, ...(v !== null ? { value: v, currency: 'TRY' } : {}) });
}

export type { Item as AnalyticsItem };
