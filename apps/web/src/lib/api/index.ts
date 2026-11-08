import 'server-only';
import { cache } from 'react';
import { createStorefrontClient, StorefrontApiError, type BlogListParams, type BlogSitemapType, type ListingParams } from '@banovit/api-client';
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

/* ---------------- blog (tags mirror the CMS Surrogate-Key: blog, blog-post:{slug}, ...) ---------------- */

export const getBlogHome = cache(async () => client.getBlogHome({ next: { tags: ['blog'], revalidate: REVALIDATE } }));

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

export function isNotFound(e: unknown): boolean {
  return e instanceof StorefrontApiError && e.status === 404;
}
