import 'server-only';
import { cache } from 'react';
import { createStorefrontClient, StorefrontApiError, type ListingParams, type Menu, type MenuKey } from '@banovit/api-client';
import { env } from '@/lib/env';

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
