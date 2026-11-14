import 'server-only';
import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import type { Seo } from '@banovit/api-client';
import { getBrand, getCategory, getTag, isNotFound, listBrandProducts, listCategoryProducts, listProducts, listTagProducts } from '@/lib/api';
import { env } from '@/lib/env';
import { listingMetadata, type Crumb } from '@/lib/seo';
import { PlpView } from './PlpView';
import { isFilteredOrSorted, pagePath, parseListingState, splitPageSegments, toApiParams, toQueryString } from './url-state';

/**
 * Route handlers for every product listing URL kept from WordPress:
 *   /shop/category/{...path}/[page/N/]   /brand/{slug}/[page/N/]   /shop/tag/{slug}/[page/N/]   /shop/[page/N/]
 */

export type SearchParams = Record<string, string | string[] | undefined>;

const HOME: Crumb = { name: 'خانه', url: '/' };
const SHOP: Crumb = { name: 'فروشگاه', url: '/shop/' };

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

function parsePage(n: string | undefined): number {
  if (n === undefined) return 1;
  const page = Number(n);
  if (!Number.isInteger(page) || page < 2 || String(page) !== n) notFound(); // /page/1/ and junk are not pages
  return page;
}

/* ---------------- category ---------------- */

async function loadCategory(segments: string[], sp: SearchParams) {
  const split = splitPageSegments(segments.map(decode));
  if (!split || split.path.length === 0 || (split.page === 1 && segments.at(-2) === 'page')) notFound();
  const path = split.path.join('/');
  const state = parseListingState(sp);
  const [category, listing] = await Promise.all([
    orNotFound(getCategory(path)),
    orNotFound(listCategoryProducts(path, toApiParams(state, split.page))),
  ]);
  return { category, listing, state, page: split.page, requestedBase: `/shop/category/${path}/` };
}

export async function categoryMetadata(segments: string[], sp: SearchParams): Promise<Metadata> {
  const { category, listing, state, page } = await loadCategory(segments, sp);
  return listingMetadata({ seo: category.seo, path: category.url, page, lastPage: listing.meta.last_page, filtered: isFilteredOrSorted(state) });
}

export async function CategoryPage({ segments, sp }: { segments: string[]; sp: SearchParams }) {
  const { category, listing, state, page, requestedBase } = await loadCategory(segments, sp);

  // Stale or flat link to a nested category: 301 to the canonical path (like WordPress).
  if (!samePath(requestedBase, category.url)) {
    permanentRedirect(`${pagePath(category.url, page)}${toQueryString(state)}`);
  }
  if (page > listing.meta.last_page && listing.meta.total > 0) notFound();

  const crumbs: Crumb[] = [HOME, SHOP, ...category.breadcrumb.map((b) => ({ name: b.name, url: b.url }))];

  return (
    <PlpView
      title={category.name}
      crumbs={crumbs}
      canonicalPath={category.url}
      basePath={category.url}
      banner={category.banner}
      subcategories={category.children}
      listing={listing}
      state={state}
      page={page}
      // «توضیحات تکمیلی» (CMS long_description_html = live _supp_desc); the short term description is not shown (Ali 2026-11-14)
      descriptionHtml={page === 1 ? (category.long_description_html ?? null) : null}
      faqs={page === 1 ? category.faqs : []}
    />
  );
}

/* ---------------- brand ---------------- */

async function loadBrand(slug: string, pageParam: string | undefined, sp: SearchParams) {
  const page = parsePage(pageParam);
  const state = parseListingState(sp);
  delete state.facets.brand;
  const [brand, listing] = await Promise.all([
    orNotFound(getBrand(decode(slug))),
    orNotFound(listBrandProducts(decode(slug), toApiParams(state, page))),
  ]);
  return { brand, listing, state, page };
}

export async function brandMetadata(slug: string, pageParam: string | undefined, sp: SearchParams): Promise<Metadata> {
  const { brand, listing, state, page } = await loadBrand(slug, pageParam, sp);
  return listingMetadata({ seo: brand.seo, path: brand.url, page, lastPage: listing.meta.last_page, filtered: isFilteredOrSorted(state) });
}

export async function BrandPage({ slug, pageParam, sp }: { slug: string; pageParam?: string; sp: SearchParams }) {
  const { brand, listing, state, page } = await loadBrand(slug, pageParam, sp);
  if (page > listing.meta.last_page && listing.meta.total > 0) notFound();
  return (
    <PlpView
      title={brand.name}
      crumbs={[HOME, SHOP, { name: brand.name, url: brand.url }]}
      canonicalPath={brand.url}
      basePath={brand.url}
      listing={listing}
      state={state}
      page={page}
      faqs={page === 1 ? brand.faqs : []}
      logo={brand.logo ?? null}
      descriptionHtml={page === 1 ? (brand.long_description_html ?? null) : null}
      showBrandRow={false}
    />
  );
}

/* ---------------- product tag ---------------- */

async function loadTag(slug: string, pageParam: string | undefined, sp: SearchParams) {
  const page = parsePage(pageParam);
  const state = parseListingState(sp);
  const [tag, listing] = await Promise.all([
    orNotFound(getTag(decode(slug))),
    orNotFound(listTagProducts(decode(slug), toApiParams(state, page))),
  ]);
  return { tag, listing, state, page };
}

export async function tagMetadata(slug: string, pageParam: string | undefined, sp: SearchParams): Promise<Metadata> {
  const { tag, listing, state, page } = await loadTag(slug, pageParam, sp);
  return listingMetadata({ seo: tag.seo, path: tag.url, page, lastPage: listing.meta.last_page, filtered: isFilteredOrSorted(state) });
}

export async function TagPage({ slug, pageParam, sp }: { slug: string; pageParam?: string; sp: SearchParams }) {
  const { tag, listing, state, page } = await loadTag(slug, pageParam, sp);
  if (page > listing.meta.last_page && listing.meta.total > 0) notFound();
  const first = page === 1;
  return (
    <PlpView
      title={tag.name}
      // live JSON-LD breadcrumb of a tag archive: خانه › tag
      crumbs={[HOME, { name: tag.name, url: tag.url }]}
      canonicalPath={tag.url}
      basePath={tag.url}
      listing={listing}
      state={state}
      page={page}
      faqs={first ? tag.faqs : []}
      descriptionHtml={first ? (tag.long_description_html ?? null) : null}
      relatedCategories={first ? tag.related_categories : []}
      relatedBrands={first ? tag.related_brands.map((b) => ({ key: b.id, slug: b.slug, label: b.name, url: b.url, image: b.logo ?? null })) : []}
      showBrandRow={false}
    />
  );
}

/* ---------------- shop ---------------- */

const SHOP_SEO: Seo = {
  title: 'فروشگاه - بانویت',
  description: 'خرید آنلاین شیرآلات، روشویی، توالت، سینک، هود و اجاق گاز با ارسال به سراسر کشور از بانویت.',
  canonical: `${env.canonicalOrigin}/shop/`,
  robots: 'index, follow',
  og_title: null,
  og_description: null,
  og_image: null,
};

async function loadShop(pageParam: string | undefined, sp: SearchParams) {
  const page = parsePage(pageParam);
  const state = parseListingState(sp);
  const listing = await listProducts(toApiParams(state, page));
  return { listing, state, page };
}

export async function shopMetadata(pageParam: string | undefined, sp: SearchParams): Promise<Metadata> {
  const { listing, state, page } = await loadShop(pageParam, sp);
  return listingMetadata({ seo: SHOP_SEO, path: '/shop/', page, lastPage: listing.meta.last_page, filtered: isFilteredOrSorted(state) });
}

export async function ShopPage({ pageParam, sp }: { pageParam?: string; sp: SearchParams }) {
  const { listing, state, page } = await loadShop(pageParam, sp);
  if (page > listing.meta.last_page && listing.meta.total > 0) notFound();
  return (
    <PlpView
      title="فروشگاه"
      crumbs={[HOME, SHOP]}
      canonicalPath="/shop/"
      basePath="/shop/"
      subcategories={listing.meta.categories ?? []}
      listing={listing}
      state={state}
      page={page}
      faqs={[]}
    />
  );
}
