/**
 * Typed client for /api/storefront/v1. Types come from the OpenAPI spec
 * (`pnpm gen:api` regenerates src/schema.d.ts); this file only adds a thin
 * fetch wrapper so callers (apps/web lib/api) control caching.
 */
import type { components, operations } from './schema';

export type Schemas = components['schemas'];
export type Category = Schemas['Category'];
export type Brand = Schemas['Brand'];
export type ProductCard = Schemas['ProductCard'];
export type ProductListing = Schemas['ProductListing'];
export type ListingMeta = Schemas['ListingMeta'];
export type Facet = Schemas['Facet'];
export type FacetOption = Schemas['FacetOption'];
export type AppliedFilter = Schemas['AppliedFilter'];
export type Money = Schemas['Money'];
export type Image = Schemas['Image'];
export type Seo = Schemas['Seo'];
export type Faq = Schemas['Faq'];
export type SortKey = Schemas['SortKey'];
export type ApiError = Schemas['Error'];
export type Cart = Schemas['Cart'];
export type CartLine = Schemas['CartLine'];
export type CartTotals = Schemas['CartTotals'];
export type CartUpdate = Schemas['CartUpdate'];
export type CartItemCreate = Schemas['CartItemCreate'];
export type Address = Schemas['Address'];
export type DeliverySlot = Schemas['DeliverySlot'];
export type PaymentMethod = Schemas['PaymentMethod'];
export type OrderSummary = Schemas['OrderSummary'];
export type PaymentStart = Schemas['PaymentStart'];
export type PlacedOrder = Schemas['PlacedOrder'];
export type Menu = Schemas['Menu'];
export type MenuItem = Schemas['MenuItem'];
export type MenuPromo = Schemas['MenuPromo'];
export type MenuKey = operations['getMenu']['parameters']['path']['key'];

export type ListingParams = NonNullable<operations['listCategoryProducts']['parameters']['query']>;

export class StorefrontApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly fields?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'StorefrontApiError';
  }
}

export interface ClientOptions {
  baseUrl: string;
  /** Sent as X-Storefront-Token by the Next.js server (exempts SSR from the per-IP limit). Never in the browser. */
  internalToken?: string;
  fetch?: typeof fetch;
}

/** Per-visitor headers for cart/checkout calls (set server-side by the BFF, never by the browser). */
export interface SessionHeaders {
  cartToken?: string | null;
  orderToken?: string | null;
  clientIp?: string | null;
  idempotencyKey?: string;
  authorization?: string | null;
}

/** Per-request fetch options (e.g. Next.js `next: { tags, revalidate }`). */
export type RequestOptions = RequestInit & { next?: { tags?: string[]; revalidate?: number | false } };

/** Serialize listing params the way the API expects: brand=a,b & filter[pa_color]=x,y */
export function listingQueryString(params: ListingParams = {}): string {
  const qs = new URLSearchParams();
  const entries = Object.entries(params) as [string, unknown][];
  for (const [key, value] of entries) {
    if (value === undefined || value === null || value === '' || value === false) continue;
    if (key === 'filter' && typeof value === 'object') {
      for (const [facet, csv] of Object.entries(value as Record<string, string>).sort(([a], [b]) => a.localeCompare(b))) {
        if (csv) qs.append(`filter[${facet}]`, csv);
      }
      continue;
    }
    qs.append(key, value === true ? '1' : String(value));
  }
  const s = qs.toString();
  return s ? `?${s}` : '';
}

function encodePath(path: string): string {
  return path
    .split('/')
    .filter(Boolean)
    .map((s) => encodeURIComponent(safeDecode(s)))
    .join('/');
}

function safeDecode(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

export function createStorefrontClient(opts: ClientOptions) {
  const doFetch = opts.fetch ?? fetch;
  const base = opts.baseUrl.replace(/\/$/, '');

  async function get<T>(path: string, init?: RequestOptions): Promise<T> {
    const headers = new Headers(init?.headers);
    headers.set('Accept', 'application/json');
    if (opts.internalToken) headers.set('X-Storefront-Token', opts.internalToken);
    if (init?.body !== undefined && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
    const res = await doFetch(`${base}${path}`, { ...init, headers });
    if (!res.ok) {
      let code = 'http_error';
      let message = res.statusText;
      let fields: Record<string, string[]> | undefined;
      try {
        const body = (await res.json()) as ApiError;
        code = body.error.code;
        message = body.error.message;
        fields = body.error.fields;
      } catch {
        /* non-JSON error body */
      }
      throw new StorefrontApiError(res.status, code, message, fields);
    }
    return (await res.json()) as T;
  }

  /** Session-bound call (cart/checkout): never cached, carries the cart/order token and visitor IP. */
  function send<T>(method: string, path: string, session: SessionHeaders, body?: unknown): Promise<T> {
    const headers = new Headers();
    if (session.cartToken) headers.set('X-Cart-Token', session.cartToken);
    if (session.orderToken) headers.set('X-Order-Token', session.orderToken);
    if (session.clientIp) headers.set('X-Client-IP', session.clientIp);
    if (session.idempotencyKey) headers.set('Idempotency-Key', session.idempotencyKey);
    if (session.authorization) headers.set('Authorization', session.authorization);
    return get<T>(path, { method, headers, cache: 'no-store', body: body === undefined ? undefined : JSON.stringify(body) });
  }

  return {
    getCategory: (path: string, init?: RequestOptions) =>
      get<{ data: Category }>(`/categories/${encodePath(path)}`, init).then((r) => r.data),
    listCategoryProducts: (path: string, params?: ListingParams, init?: RequestOptions) =>
      get<ProductListing>(`/categories/${encodePath(path)}/products${listingQueryString(params)}`, init),
    listProducts: (params?: ListingParams, init?: RequestOptions) =>
      get<ProductListing>(`/products${listingQueryString(params)}`, init),
    getBrand: (slug: string, init?: RequestOptions) =>
      get<{ data: Brand }>(`/brands/${encodePath(slug)}`, init).then((r) => r.data),
    listBrandProducts: (slug: string, params?: Omit<ListingParams, 'brand'>, init?: RequestOptions) =>
      get<ProductListing>(`/brands/${encodePath(slug)}/products${listingQueryString(params)}`, init),

    // cart & checkout (docs/api/cart.md)
    getCart: (s: SessionHeaders) => send<{ data: Cart }>('GET', '/cart', s).then((r) => r.data),
    updateCart: (s: SessionHeaders, body: CartUpdate) => send<{ data: Cart }>('PATCH', '/cart', s, body).then((r) => r.data),
    addCartItem: (s: SessionHeaders, body: CartItemCreate) => send<{ data: Cart }>('POST', '/cart/items', s, body).then((r) => r.data),
    updateCartItem: (s: SessionHeaders, id: number, body: { quantity?: number; installation?: boolean }) =>
      send<{ data: Cart }>('PATCH', `/cart/items/${id}`, s, body).then((r) => r.data),
    removeCartItem: (s: SessionHeaders, id: number) => send<{ data: Cart }>('DELETE', `/cart/items/${id}`, s).then((r) => r.data),
    applyCoupon: (s: SessionHeaders, code: string) => send<{ data: Cart }>('POST', '/cart/coupon', s, { code }).then((r) => r.data),
    removeCoupon: (s: SessionHeaders) => send<{ data: Cart }>('DELETE', '/cart/coupon', s).then((r) => r.data),
    placeOrder: (s: SessionHeaders) => send<{ data: PlacedOrder }>('POST', '/orders', s).then((r) => r.data),
    getOrder: (s: SessionHeaders, number: string) =>
      send<{ data: OrderSummary }>('GET', `/orders/${encodeURIComponent(number)}`, s).then((r) => r.data),
    payOrder: (s: SessionHeaders, number: string, paymentMethod?: string) =>
      send<{ data: { order: OrderSummary; payment: PaymentStart } }>('POST', `/orders/${encodeURIComponent(number)}/payments`, s, {
        payment_method: paymentMethod,
      }).then((r) => r.data),
    verifyZarinpal: (s: SessionHeaders, authority: string, status: string) =>
      send<{ data: { paid: boolean; ref_id: string | null; order: OrderSummary } }>('POST', '/payments/zarinpal/verify', s, {
        authority,
        status,
      }).then((r) => r.data),
    getMenu: (key: MenuKey, init?: RequestOptions) => get<{ data: Menu }>(`/menus/${key}`, init).then((r) => r.data),
  };
}

export type StorefrontClient = ReturnType<typeof createStorefrontClient>;
