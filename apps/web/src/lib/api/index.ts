import 'server-only';
import { cache } from 'react';
import { createStorefrontClient, StorefrontApiError, type ListingParams } from '@banovit/api-client';
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

export const getProduct = cache(async (slug: string) =>
  client.getProduct(slug, { next: { tags: ['products', `product-slug:${slug}`], revalidate: REVALIDATE } }),
);

/** Uncached: used by the BFF route the browser polls after the (CDN-cached) page loads. */
export const storefront = client;

export function isNotFound(e: unknown): boolean {
  return e instanceof StorefrontApiError && e.status === 404;
}
