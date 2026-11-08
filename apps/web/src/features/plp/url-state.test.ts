import { describe, expect, it } from 'vitest';
import {
  isFilteredOrSorted,
  pagePath,
  parseListingState,
  splitPageSegments,
  toApiParams,
  toggleValue,
  toQueryString,
} from './url-state';

describe('parseListingState', () => {
  it('reads the live WordPress filter params', () => {
    const s = parseListingState({
      orderby: 'price-desc',
      filter_brand: 'Golsar,alka',
      cwa_brand: 'alka',
      filter_color: 'white',
      min_price: '1000000',
      max_price: '5٬000٬000',
      in_stock: '1',
      utm_source: 'x',
    });
    expect(s.sort).toBe('price_desc');
    expect(s.facets).toEqual({ brand: ['golsar', 'alka'], pa_color: ['white'] });
    expect(s.minToman).toBe(1_000_000);
    expect(s.inStock).toBe(true);
    expect(isFilteredOrSorted(s)).toBe(true);
  });

  it('a clean URL is not filtered', () => {
    expect(isFilteredOrSorted(parseListingState({ utm_source: 'google', gclid: 'x' }))).toBe(false);
  });
});

describe('toApiParams', () => {
  it('converts toman to rial and splits brand from attribute facets', () => {
    const s = parseListingState({ filter_brand: 'alka', filter_material: 'mdf', min_price: '100' });
    expect(toApiParams(s, 2)).toEqual({
      page: 2,
      sort: 'newest',
      brand: 'alka',
      filter: { pa_material: 'mdf' },
      min_price: 1000,
      max_price: undefined,
      in_stock: undefined,
      on_sale: undefined,
    });
  });
});

describe('toQueryString', () => {
  it('is stable regardless of selection order', () => {
    const a = toggleValue(toggleValue(parseListingState({}), 'brand', 'b'), 'brand', 'a');
    expect(toQueryString(a)).toBe('?filter_brand=a%2Cb');
    expect(toQueryString(toggleValue(a, 'brand', 'a'))).toBe('?filter_brand=b');
    expect(toQueryString(parseListingState({}))).toBe('');
  });
});

describe('paths', () => {
  it('handles WordPress /page/N/', () => {
    expect(splitPageSegments(['vanity', 'cabinet', 'page', '3'])).toEqual({ path: ['vanity', 'cabinet'], page: 3 });
    expect(splitPageSegments(['vanity'])).toEqual({ path: ['vanity'], page: 1 });
    expect(splitPageSegments(['vanity', 'page', '03'])).toBeNull();
    expect(pagePath('/shop/category/vanity/', 1)).toBe('/shop/category/vanity/');
    expect(pagePath('/shop/category/vanity/', 2)).toBe('/shop/category/vanity/page/2/');
  });
});
