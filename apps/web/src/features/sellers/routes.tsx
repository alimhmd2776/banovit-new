import 'server-only';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSeller, isNotFound, listSellerProducts, listSellerReviews } from '@/lib/api';
import { listingMetadata, type Crumb } from '@/lib/seo';
import { isFilteredOrSorted, parseListingState, toApiParams } from '@/features/plp/url-state';
import type { SearchParams } from '@/features/plp/routes';
import { SellerView } from './SellerView';

/** /seller/{slug}/ and /seller/{slug}/page/N/ (new on this site: no WordPress equivalent to keep). */

function decode(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
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
  if (!Number.isInteger(page) || page < 2 || String(page) !== n) notFound();
  return page;
}

async function loadSeller(slug: string, pageParam: string | undefined, sp: SearchParams) {
  const page = parsePage(pageParam);
  const state = parseListingState(sp);
  const s = decode(slug);
  const [seller, listing, reviews] = await Promise.all([
    orNotFound(getSeller(s)),
    orNotFound(listSellerProducts(s, toApiParams(state, page))),
    orNotFound(listSellerReviews(s)),
  ]);
  return { seller, listing, reviews, state, page };
}

export async function sellerMetadata(slug: string, pageParam: string | undefined, sp: SearchParams): Promise<Metadata> {
  const { seller, listing, state, page } = await loadSeller(slug, pageParam, sp);
  const meta = listingMetadata({ seo: seller.seo, path: seller.url, page, lastPage: listing.meta.last_page, filtered: isFilteredOrSorted(state) });
  return { ...meta, openGraph: { ...meta.openGraph, type: 'profile', images: seller.logo ? [{ url: seller.logo.url, alt: seller.name }] : meta.openGraph?.images } };
}

export async function SellerPage({ slug, pageParam, sp }: { slug: string; pageParam?: string; sp: SearchParams }) {
  const { seller, listing, reviews, state, page } = await loadSeller(slug, pageParam, sp);
  if (page > listing.meta.last_page && listing.meta.total > 0) notFound();
  const crumbs: Crumb[] = [{ name: 'بانویت', url: '/' }, ...seller.breadcrumb.map((b) => ({ name: b.name, url: b.url }))];
  return <SellerView seller={seller} crumbs={crumbs} listing={listing} reviews={reviews} state={state} page={page} />;
}
