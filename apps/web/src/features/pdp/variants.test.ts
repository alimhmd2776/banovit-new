import { describe, expect, it } from 'vitest';
import type { ProductOption, ProductVariant } from '@banovit/api-client';
import { choose, initialSelection, matchVariant, selectionQuery, valueState } from './variants';

const options: ProductOption[] = [
  { key: 'pa_color', label: 'رنگ', type: 'swatch', values: [{ value: 'white', label: 'سفید', hex: '#fff' }, { value: 'cream', label: 'کرم', hex: null }] },
  { key: 'pa_size', label: 'سایز', type: 'button', values: [{ value: '60', label: '۶۰', hex: null }, { value: '80', label: '۸۰', hex: null }] },
];
const money = (t: number) => ({ amount: t * 10, currency: 'IRR' as const });
const v = (id: number, color: string | null, size: string | null, price: number, inStock = true): ProductVariant => ({
  id, sku: null, attributes: { pa_color: color, pa_size: size }, price: money(price), regular_price: null, discount_percent: 0, in_stock: inStock, image: null,
});
const variants = [v(1, 'white', '60', 300), v(2, 'white', '80', 200, false), v(3, 'cream', '80', 400), v(4, 'cream', '60', 250)];

describe('variant selection', () => {
  it('starts on the cheapest in-stock variant', () => {
    expect(initialSelection(options, variants)).toEqual({ pa_color: 'cream', pa_size: '60' });
  });

  it('honours WordPress ?attribute_pa_x= links', () => {
    expect(initialSelection(options, variants, { attribute_pa_color: 'white' })).toEqual({ pa_color: 'white', pa_size: '60' });
    expect(initialSelection(options, variants, { attribute_pa_size: '80' })).toEqual({ pa_color: 'cream', pa_size: '80' });
  });

  it('matches complete selections only, and "any" attributes match everything', () => {
    expect(matchVariant(options, variants, { pa_color: 'white', pa_size: null })).toBeNull();
    expect(matchVariant(options, variants, { pa_color: 'white', pa_size: '80' })?.id).toBe(2);
    const anySize = [v(9, 'white', null, 100)];
    expect(matchVariant(options, anySize, { pa_color: 'white', pa_size: '80' })?.id).toBe(9);
  });

  it('reports out-of-stock and impossible values', () => {
    expect(valueState(variants, { pa_color: 'white', pa_size: '60' }, 'pa_size', '80')).toBe('out_of_stock');
    expect(valueState(variants, { pa_color: 'white', pa_size: '60' }, 'pa_color', 'cream')).toBe('available');
    expect(valueState([v(1, 'white', '60', 1)], { pa_color: 'white', pa_size: '60' }, 'pa_size', '80')).toBe('unavailable');
  });

  it('moves other choices to a valid variant when needed', () => {
    const only = [v(1, 'white', '60', 1), v(2, 'cream', '80', 1)];
    expect(choose(options, only, { pa_color: 'white', pa_size: '60' }, 'pa_color', 'cream')).toEqual({ pa_color: 'cream', pa_size: '80' });
    expect(choose(options, variants, { pa_color: 'white', pa_size: '60' }, 'pa_size', '80')).toEqual({ pa_color: 'white', pa_size: '80' });
  });

  it('builds a shareable query', () => {
    expect(selectionQuery({ pa_color: 'white', pa_size: null })).toBe('?attribute_pa_color=white');
  });
});
