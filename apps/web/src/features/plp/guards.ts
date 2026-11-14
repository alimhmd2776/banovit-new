import 'server-only';
import { notFound, permanentRedirect } from 'next/navigation';
import { StorefrontApiError, type ListingParams } from '@banovit/api-client';
import {
  getBrand,
  getCategory,
  getPage,
  getProduct,
  getSeller,
  getTag,
  isNotFound,
  listBrandProducts,
  listCategoryProducts,
  listProducts,
  listSellerProducts,
  listTagProducts,
  movedLocation,
} from '@/lib/api';
import { toPagePath } from '@/features/pages/path';
import { pagePath, parseListingState, splitPageSegments, toApiParams } from './url-state';

/**
 * Real HTTP 404s / 301s for dynamic pages.
 *
 * A route's loading.tsx (skeleton) makes Next stream the response, so a
 * notFound() or permanentRedirect() thrown later by the page arrives after
 * the 200 status was sent (a «soft 404»: noindex HTML with status 200, and a
 * client-side redirect). These checks run in each dynamic segment's
 * layout.tsx, which renders before its own loading boundary, so the status
 * is still open. They use the same cached API calls as the pages (no extra
 * CMS requests). Query strings are not visible to layouts, so the canonical
 * redirects here go to the clean URL.
 */

function decode(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

function samePath(a: string, b: string): boolean {
  return decode(a).toLowerCase() === decode(b).toLowerCase();
}

async function orNotFound<T>(p: Promise<T>): Promise<T> {
  try {
    return await p;
  } catch (e) {
    if (isNotFound(e)) notFound();
    throw e;
  }
}

/** "/page/N/" segment value: N >= 2 written plainly, else 404 (like WordPress). */
export function parsePageParam(n: string | undefined): number {
  if (n === undefined) return 1;
  const page = Number(n);
  if (!Number.isInteger(page) || page < 2 || String(page) !== n) notFound();
  return page;
}

const UNFILTERED = toApiParams(parseListingState({}), 1);

/** Page N past the last page of the unfiltered listing is a 404. */
async function ensurePageInRange(page: number, list: (params: ListingParams) => Promise<{ meta: { last_page: number; total: number } }>) {
  if (page <= 1) return;
  let meta;
  try {
    ({ meta } = await list({ ...UNFILTERED, page }));
  } catch (e) {
    // 404, or 422 for a page number beyond what the API accepts
    if (e instanceof StorefrontApiError && (e.status === 404 || e.status === 422)) notFound();
    throw e;
  }
  if (page > meta.last_page && meta.total > 0) notFound();
}

export async function ensureCategory(segments: string[]) {
  const split = splitPageSegments(segments.map(decode));
  if (!split || split.path.length === 0 || (split.page === 1 && segments.at(-2) === 'page')) notFound();
  const path = split.path.join('/');
  const category = await orNotFound(getCategory(path));
  // Stale or flat link to a nested category: 301 to the canonical path (like WordPress).
  if (!samePath(`/shop/category/${path}/`, category.url)) permanentRedirect(pagePath(category.url, split.page));
  await ensurePageInRange(split.page, (p) => listCategoryProducts(path, p));
}

export async function ensureBrand(slug: string, pageParam?: string) {
  const page = parsePageParam(pageParam);
  await orNotFound(getBrand(decode(slug)));
  await ensurePageInRange(page, (p) => listBrandProducts(decode(slug), p));
}

export async function ensureTag(slug: string, pageParam?: string) {
  const page = parsePageParam(pageParam);
  await orNotFound(getTag(decode(slug)));
  await ensurePageInRange(page, (p) => listTagProducts(decode(slug), p));
}

export async function ensureSeller(slug: string, pageParam?: string) {
  const page = parsePageParam(pageParam);
  await orNotFound(getSeller(decode(slug)));
  await ensurePageInRange(page, (p) => listSellerProducts(decode(slug), p));
}

export async function ensureShopPage(pageParam: string) {
  await ensurePageInRange(parsePageParam(pageParam), (p) => listProducts(p));
}

export async function ensureProduct(slug: string) {
  let product;
  try {
    product = await getProduct(decode(slug));
  } catch (e) {
    const moved = movedLocation(e); // renamed slug (WP _wp_old_slug)
    if (moved) permanentRedirect(moved);
    if (isNotFound(e)) notFound();
    throw e;
  }
  if (decode(slug) !== product.slug) permanentRedirect(product.path);
}

export async function ensureContentPage(segments: string[]) {
  const path = toPagePath(segments);
  if (!path) notFound();
  const page = await orNotFound(getPage(path));
  if (decode(`/${segments.join('/')}/`) !== decode(page.url)) permanentRedirect(page.url);
}
