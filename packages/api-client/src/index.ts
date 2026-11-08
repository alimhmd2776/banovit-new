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
export type ContentPage = Schemas['ContentPage'];
export type ContentBlock = Schemas['ContentBlock'];
export type PageListItem = Schemas['PageListItem'];
export type PageCrumb = Schemas['PageCrumb'];
export type Crumb = Schemas['Crumb'];
export type BlogHome = Schemas['BlogHome'];
export type BlogSection = Schemas['BlogSection'];
export type BlogPostCard = Schemas['BlogPostCard'];
export type BlogPost = Schemas['BlogPost'];
export type BlogBlock = Schemas['BlogBlock'];
export type BlogProductsBlock = Schemas['BlogProductsBlock'];
export type BlogNoteBlock = Schemas['BlogNoteBlock'];
export type BlogArticleBlock = Schemas['BlogArticleBlock'];
export type BlogQuizBlock = Schemas['BlogQuizBlock'];
export type BlogMapBlock = Schemas['BlogMapBlock'];
export type BlogStatBlock = Schemas['BlogStatBlock'];
export type BlogPostSidebar = Schemas['BlogPostSidebar'];
export type BlogSidebarSection = Schemas['BlogSidebarSection'];
export type BlogUi = Schemas['BlogUi'];
export type BlogAuthor = Schemas['BlogAuthor'];
export type BlogAuthorPage = Schemas['BlogAuthorPage'];
export type BlogCategory = Schemas['BlogCategory'];
export type BlogCategoryRef = Schemas['BlogCategoryRef'];
export type BlogCategoryTab = Schemas['BlogCategoryTab'];
export type BlogTerm = Schemas['BlogTerm'];
export type BlogFaq = Schemas['BlogFaq'];
export type TocItem = Schemas['TocItem'];
export type BlogPostListing = Schemas['BlogPostListing'];
export type SitemapRow = Schemas['SitemapRow'];
export type BlogListParams = NonNullable<operations['listBlogPosts']['parameters']['query']>;
export type BlogSitemapType = 'posts' | 'categories' | 'tags' | 'authors';
export type ContactSettings = Schemas['ContactSettings'];
export type AuthSettings = Schemas['AuthSettings'];
// --- plp ---
export type ListingSettings = Schemas['ListingSettings'];
// --- /plp ---
export type CallbackRequest = Schemas['CallbackRequest'];
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
export type ProductDetail = Schemas['ProductDetail'];
export type ProductOption = Schemas['ProductOption'];
export type ProductVariant = Schemas['ProductVariant'];
export type ProductAddon = Schemas['ProductAddon'];
export type VanityCalculator = Schemas['VanityCalculator'];
export type ProductOffers = Schemas['ProductOffers'];
export type ProductLive = Schemas['ProductLive'];
export type ProductRating = Schemas['ProductRating'];
export type Review = Schemas['Review'];
export type ReviewListing = Schemas['ReviewListing'];
export type Availability = Schemas['Availability'];
export type Menu = Schemas['Menu'];
export type MenuItem = Schemas['MenuItem'];
export type MenuPromo = Schemas['MenuPromo'];
export type MenuKey = operations['getMenu']['parameters']['path']['key'];
export type HeaderSettings = Schemas['HeaderSettings'];
export type Customer = Schemas['Customer'];
export type CustomerSession = Schemas['CustomerSession'];
export type OtpChallenge = Schemas['OtpChallenge'];
// «حساب کاربری» (docs/api/account.md)
export type AccountSummary = Schemas['AccountSummary'];
export type Profile = Schemas['Profile'];
export type OrderTabCounts = Schemas['OrderTabCounts'];
export type OrderStep = Schemas['OrderStep'];
export type AccountOrder = Schemas['AccountOrder'];
export type AccountOrderDetail = Schemas['AccountOrderDetail'];
export type OrderItem = Schemas['OrderItem'];
export type CustomerAddress = Schemas['CustomerAddress'];
export type CustomerAddressInput = Schemas['CustomerAddressInput'];
export type MyReview = Schemas['MyReview'];
export type CustomerNotification = Schemas['Notification'];
export type TicketTopic = Schemas['TicketTopic'];
export type TicketSummary = Schemas['TicketSummary'];
export type TicketDetail = Schemas['TicketDetail'];
export type TicketMessage = Schemas['TicketMessage'];
export type AccountSettings = Schemas['AccountSettings'];

// --- sellers ---
export type SellerCard = Schemas['SellerCard'];
export type Seller = Schemas['Seller'];
export type SellerStats = Schemas['SellerStats'];
export type OpeningDay = Schemas['OpeningDay'];
export type SellerReview = Schemas['SellerReview'];
export type SellerReviewList = Schemas['SellerReviewList'];

export type ListingParams = NonNullable<operations['listCategoryProducts']['parameters']['query']>;

export class StorefrontApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly fields?: Record<string, string[]>,
    /** Set when code === 'moved': the entity's current URL (answer with a 301). */
    public readonly location?: string,
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

export function blogQueryString(params: BlogListParams = {}): string {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    qs.append(key, String(value));
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
      let location: string | undefined;
      try {
        const body = (await res.json()) as ApiError;
        code = body.error.code;
        message = body.error.message;
        fields = body.error.fields;
        location = body.error.location;
      } catch {
        /* non-JSON error body */
      }
      throw new StorefrontApiError(res.status, code, message, fields, location);
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
    listPages: (init?: RequestOptions) => get<{ data: PageListItem[] }>('/pages', init).then((r) => r.data),
    getPage: (path: string, init?: RequestOptions) =>
      get<{ data: ContentPage }>(`/pages/${encodePath(path)}`, init).then((r) => r.data),
    // --- plp ---
    getListingSettings: (init?: RequestOptions) =>
      get<{ data: ListingSettings }>('/settings/listing', init).then((r) => r.data),
    // --- /plp ---
    getContactSettings: (init?: RequestOptions) =>
      get<{ data: ContactSettings }>('/settings/contact', init).then((r) => r.data),
    getAccountSettings: (init?: RequestOptions) =>
      get<{ data: AccountSettings }>('/settings/account', init).then((r) => r.data),
    getAuthSettings: (init?: RequestOptions) => get<{ data: AuthSettings }>('/settings/auth', init).then((r) => r.data),

    getBlogHome: (init?: RequestOptions) => get<{ data: BlogHome }>('/blog/home', init).then((r) => r.data),
    getBlogUi: (init?: RequestOptions) => get<{ data: BlogUi }>('/blog/ui', init).then((r) => r.data),
    listBlogPosts: (params?: BlogListParams, init?: RequestOptions) =>
      get<BlogPostListing>(`/blog/posts${blogQueryString(params)}`, init),
    getBlogPost: (slug: string, init?: RequestOptions) =>
      get<{ data: BlogPost }>(`/blog/posts/${encodePath(slug)}`, init).then((r) => r.data),
    listBlogCategories: (init?: RequestOptions) =>
      get<{ data: BlogCategoryTab[] }>('/blog/categories', init).then((r) => r.data),
    getBlogCategory: (path: string, init?: RequestOptions) =>
      get<{ data: BlogCategory }>(`/blog/categories/${encodePath(path)}`, init).then((r) => r.data),
    getBlogTag: (slug: string, init?: RequestOptions) =>
      get<{ data: BlogTerm }>(`/blog/tags/${encodePath(slug)}`, init).then((r) => r.data),
    getBlogAuthor: (slug: string, init?: RequestOptions) =>
      get<{ data: BlogAuthorPage }>(`/blog/authors/${encodePath(slug)}`, init).then((r) => r.data),
    getBlogSitemap: (type: BlogSitemapType, init?: RequestOptions) =>
      get<{ data: SitemapRow[] }>(`/blog/sitemap/${type}`, init).then((r) => r.data),
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
    getProduct: (slug: string, init?: RequestOptions) =>
      get<{ data: ProductDetail }>(`/products/${encodePath(slug)}`, init).then((r) => r.data),
    getProductLive: (slug: string, init?: RequestOptions) =>
      get<{ data: ProductLive }>(`/products/${encodePath(slug)}/live`, init).then((r) => r.data),
    listProductReviews: (slug: string, page = 1, init?: RequestOptions) =>
      get<ReviewListing>(`/products/${encodePath(slug)}/reviews${page > 1 ? `?page=${page}` : ''}`, init),
    getMenu: (key: MenuKey, init?: RequestOptions) => get<{ data: Menu }>(`/menus/${key}`, init).then((r) => r.data),
    getHeaderSettings: (init?: RequestOptions) => get<{ data: HeaderSettings }>('/settings/header', init).then((r) => r.data),
    // --- sellers ---
    listSellers: (init?: RequestOptions) => get<{ data: SellerCard[] }>('/sellers', init).then((r) => r.data),
    getSeller: (slug: string, init?: RequestOptions) =>
      get<{ data: Seller }>(`/sellers/${encodePath(slug)}`, init).then((r) => r.data),
    listSellerProducts: (slug: string, params?: ListingParams, init?: RequestOptions) =>
      get<ProductListing>(`/sellers/${encodePath(slug)}/products${listingQueryString(params)}`, init),
    listSellerReviews: (slug: string, page = 1, init?: RequestOptions) =>
      get<SellerReviewList>(`/sellers/${encodePath(slug)}/reviews${page > 1 ? `?page=${page}` : ''}`, init),
  };
}

export type StorefrontClient = ReturnType<typeof createStorefrontClient>;
