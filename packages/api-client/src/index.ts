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
export type Crumb = Schemas['Crumb'];
export type BlogHome = Schemas['BlogHome'];
export type BlogSection = Schemas['BlogSection'];
export type BlogPostCard = Schemas['BlogPostCard'];
export type BlogPost = Schemas['BlogPost'];
export type BlogBlock = Schemas['BlogBlock'];
export type BlogProductsBlock = Schemas['BlogProductsBlock'];
export type BlogNoteBlock = Schemas['BlogNoteBlock'];
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

export type ListingParams = NonNullable<operations['listCategoryProducts']['parameters']['query']>;

export class StorefrontApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
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
    const res = await doFetch(`${base}${path}`, { ...init, headers });
    if (!res.ok) {
      let code = 'http_error';
      let message = res.statusText;
      let location: string | undefined;
      try {
        const body = (await res.json()) as ApiError;
        code = body.error.code;
        message = body.error.message;
        location = body.error.location;
      } catch {
        /* non-JSON error body */
      }
      throw new StorefrontApiError(res.status, code, message, location);
    }
    return (await res.json()) as T;
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

    getBlogHome: (init?: RequestOptions) => get<{ data: BlogHome }>('/blog/home', init).then((r) => r.data),
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
  };
}

export type StorefrontClient = ReturnType<typeof createStorefrontClient>;
