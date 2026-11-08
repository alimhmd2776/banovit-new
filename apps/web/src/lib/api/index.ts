import 'server-only';
import { cache } from 'react';
import { createStorefrontClient, StorefrontApiError, type BlogListParams, type BlogSitemapType, type ListingParams, type HeaderSettings, type Menu, type MenuKey } from '@banovit/api-client';
import { env } from '@/lib/env';
import { AUTH_SETTINGS_FALLBACK, AUTH_TEXT_DEFAULTS } from '@/features/auth/links';

/**
 * The only way pages get data (docs/05-conventions.md). Every call carries
 * cache tags so a CMS change can revalidate exactly the affected pages via
 * POST /api/revalidate (tags mirror the API's Surrogate-Key header).
 */
const client = createStorefrontClient({ baseUrl: env.apiUrl, internalToken: env.apiToken });

const REVALIDATE = 3600;

export const getCategory = cache(async (path: string) =>
  client.getCategory(path, { next: { tags: ['categories', `category-path:${path}`], revalidate: REVALIDATE } }),
);

export const listCategoryProducts = cache(async (path: string, params: ListingParams) =>
  client.listCategoryProducts(path, params, { next: { tags: ['products', `category-path:${path}`], revalidate: 300 } }),
);

export const listProducts = cache(async (params: ListingParams) =>
  client.listProducts(params, { next: { tags: ['products'], revalidate: 300 } }),
);

export const getBrand = cache(async (slug: string) =>
  client.getBrand(slug, { next: { tags: ['brands', `brand:${slug}`], revalidate: REVALIDATE } }),
);

export const listBrandProducts = cache(async (slug: string, params: ListingParams) =>
  client.listBrandProducts(slug, params, { next: { tags: ['products', `brand:${slug}`], revalidate: 300 } }),
);

/** CMS content pages; tags match the CMS revalidation (pages, page:{id}, page-path:{path}). */
export const getPage = cache(async (path: string) =>
  client.getPage(path, { next: { tags: ['pages', `page-path:${path}`], revalidate: REVALIDATE } }),
);

export const listPages = cache(async () => client.listPages({ next: { tags: ['pages'], revalidate: REVALIDATE } }));
/* ---------------- blog (tags mirror the CMS Surrogate-Key: blog, blog-post:{slug}, ...) ---------------- */

export const getBlogHome = cache(async () => client.getBlogHome({ next: { tags: ['blog'], revalidate: REVALIDATE } }));

/** Blog texts and switches from the CMS panel; null (built-in defaults) when the CMS is unreachable. */
export const getBlogUi = cache(async () => client.getBlogUi({ next: { tags: ['blog'], revalidate: REVALIDATE } }).catch(() => null));

export const listBlogPosts = cache(async (params: BlogListParams) =>
  client.listBlogPosts(params, { next: { tags: ['blog'], revalidate: REVALIDATE } }),
);

export const getBlogPost = cache(async (slug: string) =>
  client.getBlogPost(slug, { next: { tags: ['blog', `blog-post:${slug}`], revalidate: REVALIDATE } }),
);

export const listBlogCategories = cache(async () => client.listBlogCategories({ next: { tags: ['blog'], revalidate: REVALIDATE } }));

export const getBlogCategory = cache(async (path: string) =>
  client.getBlogCategory(path, { next: { tags: ['blog', `blog-category:${path}`], revalidate: REVALIDATE } }),
);

export const getBlogTag = cache(async (slug: string) =>
  client.getBlogTag(slug, { next: { tags: ['blog', `blog-tag:${slug}`], revalidate: REVALIDATE } }),
);

export const getBlogAuthor = cache(async (slug: string) =>
  client.getBlogAuthor(slug, { next: { tags: ['blog', `blog-author:${slug}`], revalidate: REVALIDATE } }),
);

export const getBlogSitemap = cache(async (type: BlogSitemapType) =>
  client.getBlogSitemap(type, { next: { tags: ['blog'], revalidate: REVALIDATE } }),
);

/** Renamed entity: the CMS answers 404 {code: moved, location}. */
export function movedLocation(e: unknown): string | null {
  return e instanceof StorefrontApiError && e.code === 'moved' && e.location ? e.location : null;
}

/** /login/ texts, links and code length from the CMS panel; built-in defaults when the CMS is unreachable. */
export const getAuthSettings = cache(async () =>
  client
    .getAuthSettings({ next: { tags: ['settings', 'settings:auth'], revalidate: 300 } })
    .then((s) => ({ ...s, texts: { ...AUTH_TEXT_DEFAULTS, ...s.texts } }))
    .catch(() => AUTH_SETTINGS_FALLBACK),
);

/** «تماس با ما» content edited in the CMS (tag mirrors the API Surrogate-Key `settings:contact`). */
// --- plp ---
/** Listing-page texts + footer («صفحه فروشگاه و فوتر»). Never throws: a CMS outage hides those blocks instead of failing the page. */
export const getListingSettings = cache(async () => {
  try {
    return await client.getListingSettings({ next: { tags: ['settings', 'settings:listing'], revalidate: 300 } });
  } catch (e) {
    console.error('listing settings unavailable', e);
    return null;
  }
});
// --- /plp ---

export const getContactSettings = cache(async () =>
  client.getContactSettings({ next: { tags: ['settings', 'settings:contact'], revalidate: 300 } }),
);

/** «تنظیمات حساب کاربری سایت» edited in the CMS panel (tag mirrors the Surrogate-Key `settings:account`). */
export const getAccountSettings = cache(async () =>
  client.getAccountSettings({ next: { tags: ['settings', 'settings:account'], revalidate: 300 } }),
);

export const getProduct = cache(async (slug: string) =>
  client.getProduct(slug, { next: { tags: ['products', `product-slug:${slug}`], revalidate: REVALIDATE } }),
);

/** Uncached: used by the BFF route the browser polls after the (CDN-cached) page loads. */
export const storefront = client;
/**
 * CMS-managed navigation (header, mega menu, mobile sheets). Never throws: a
 * CMS outage renders the header without that menu instead of failing the page.
 */
export const getMenu = cache(async (key: MenuKey): Promise<Menu> => {
  try {
    return await client.getMenu(key, { next: { tags: ['menu', `menu:${key}`], revalidate: 600 } });
  } catch (e) {
    console.error(`menu ${key} unavailable`, e);
    return { key, name: '', items: [] };
  }
});

export function isNotFound(e: unknown): boolean {
  return e instanceof StorefrontApiError && e.status === 404;
}

/**
 * «تنظیمات هدر» (banner, logo, support line, UI copy). Never throws: null
 * means the CMS is unreachable and the header falls back to built-in values.
 */
export const getHeaderSettings = cache(async (): Promise<HeaderSettings | null> => {
  try {
    return await client.getHeaderSettings({ next: { tags: ['settings', 'settings:header'], revalidate: 600 } });
  } catch (e) {
    console.error('header settings unavailable', e);
    return null;
  }
});

export const getSeller = cache(async (slug: string) =>
  client.getSeller(slug, { next: { tags: ['sellers', `seller:${slug}`], revalidate: REVALIDATE } }),
);

export const listSellerProducts = cache(async (slug: string, params: ListingParams) =>
  client.listSellerProducts(slug, params, { next: { tags: ['products', `seller:${slug}`], revalidate: 300 } }),
);

export const listSellerReviews = cache(async (slug: string, page = 1) =>
  client.listSellerReviews(slug, page, { next: { tags: ['reviews', `seller:${slug}`], revalidate: REVALIDATE } }),
);
