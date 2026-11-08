/**
 * Listing URL <-> API params. The storefront keeps the live WordPress filter
 * query format so existing links, ads and GSC history keep working:
 *
 *   ?orderby=date|popularity|rating|price|price-desc
 *   ?filter_brand=alka,golsar   (cwa_brand accepted as an alias)
 *   ?filter_color=white         -> API facet pa_color
 *   ?min_price=&max_price=      in toman, like the live site (API speaks rial)
 *   ?in_stock=1  ?on_sale=1
 *   /page/N/ in the path (not a query param)
 */
import type { ListingParams, SortKey } from '@banovit/api-client';

export type ListingState = {
  sort: SortKey;
  /** facet key as the API names it: "brand", "pa_color", ... */
  facets: Record<string, string[]>;
  minToman: number | null;
  maxToman: number | null;
  inStock: boolean;
  onSale: boolean;
};

export const DEFAULT_SORT: SortKey = 'newest';

const ORDERBY_TO_SORT: Record<string, SortKey> = {
  date: 'newest',
  popularity: 'popular',
  rating: 'rating',
  price: 'price_asc',
  'price-desc': 'price_desc',
};
const SORT_TO_ORDERBY = Object.fromEntries(Object.entries(ORDERBY_TO_SORT).map(([k, v]) => [v, k])) as Record<SortKey, string>;

type SearchParams = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

function csv(v: string | undefined): string[] {
  if (!v) return [];
  return [...new Set(v.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean))];
}

function toInt(v: string | undefined): number | null {
  if (!v) return null;
  const n = Number.parseInt(v.replace(/[^\d]/g, ''), 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function urlKeyToFacet(key: string): string | null {
  if (key === 'cwa_brand' || key === 'filter_brand') return 'brand';
  if (key.startsWith('filter_')) return `pa_${key.slice('filter_'.length)}`;
  return null;
}

export function facetToUrlKey(facet: string): string {
  return facet === 'brand' ? 'filter_brand' : `filter_${facet.replace(/^pa_/, '')}`;
}

export function parseListingState(sp: SearchParams): ListingState {
  const facets: Record<string, string[]> = {};
  for (const [key, raw] of Object.entries(sp)) {
    const facet = urlKeyToFacet(key);
    if (!facet) continue;
    const values = csv(first(raw));
    if (values.length) facets[facet] = [...new Set([...(facets[facet] ?? []), ...values])];
  }
  return {
    sort: ORDERBY_TO_SORT[first(sp.orderby) ?? ''] ?? DEFAULT_SORT,
    facets,
    minToman: toInt(first(sp.min_price)),
    maxToman: toInt(first(sp.max_price)),
    inStock: first(sp.in_stock) === '1',
    onSale: first(sp.on_sale) === '1',
  };
}

export function hasActiveFilters(s: ListingState): boolean {
  return Object.keys(s.facets).length > 0 || s.minToman !== null || s.maxToman !== null || s.inStock || s.onSale;
}

/** True when the URL differs from the clean category URL (filters or non-default sort) -> noindex. */
export function isFilteredOrSorted(s: ListingState): boolean {
  return hasActiveFilters(s) || s.sort !== DEFAULT_SORT;
}

export function toApiParams(s: ListingState, page: number): ListingParams {
  const filter: Record<string, string> = {};
  for (const [facet, values] of Object.entries(s.facets)) {
    if (facet !== 'brand' && values.length) filter[facet] = values.join(',');
  }
  return {
    page,
    sort: s.sort,
    brand: s.facets.brand?.join(',') || undefined,
    filter: Object.keys(filter).length ? filter : undefined,
    min_price: s.minToman !== null ? s.minToman * 10 : undefined,
    max_price: s.maxToman !== null ? s.maxToman * 10 : undefined,
    in_stock: s.inStock || undefined,
    on_sale: s.onSale || undefined,
  };
}

/** Query string for a state, keys in a stable order (one URL per filter combination). */
export function toQueryString(s: ListingState): string {
  const qs = new URLSearchParams();
  if (s.sort !== DEFAULT_SORT) qs.set('orderby', SORT_TO_ORDERBY[s.sort]);
  for (const facet of Object.keys(s.facets).sort()) {
    const values = s.facets[facet];
    if (values?.length) qs.set(facetToUrlKey(facet), [...values].sort().join(','));
  }
  if (s.minToman !== null) qs.set('min_price', String(s.minToman));
  if (s.maxToman !== null) qs.set('max_price', String(s.maxToman));
  if (s.inStock) qs.set('in_stock', '1');
  if (s.onSale) qs.set('on_sale', '1');
  const out = qs.toString();
  return out ? `?${out}` : '';
}

/** WordPress pagination path: /base/ for page 1, /base/page/N/ otherwise. basePath ends with "/". */
export function pagePath(basePath: string, page: number): string {
  return page <= 1 ? basePath : `${basePath}page/${page}/`;
}

/** Split a catch-all segment list into category path + page (".../page/3"). */
export function splitPageSegments(segments: string[]): { path: string[]; page: number } | null {
  const n = segments.length;
  if (n >= 2 && segments[n - 2] === 'page') {
    const page = Number(segments[n - 1]);
    if (!Number.isInteger(page) || page < 1 || String(page) !== segments[n - 1]) return null;
    return { path: segments.slice(0, n - 2), page };
  }
  return { path: segments, page: 1 };
}

export function toggleValue(s: ListingState, facet: string, value: string): ListingState {
  const current = s.facets[facet] ?? [];
  const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
  const facets = { ...s.facets };
  if (next.length) facets[facet] = next;
  else delete facets[facet];
  return { ...s, facets };
}

export function clearFilters(s: ListingState): ListingState {
  return { sort: s.sort, facets: {}, minToman: null, maxToman: null, inStock: false, onSale: false };
}
