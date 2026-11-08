import { describe, expect, it } from 'vitest';
import { defaultOffer, type Offer } from './PurchaseContext';

const o = (seller: string, amount: number, in_stock = true): Offer => ({ seller, variant_id: null, price: { amount, currency: 'IRR' }, regular_price: null, in_stock });

describe('defaultOffer', () => {
  it('prefers Banovit when it has stock, even if a supplier is cheaper', () => {
    expect(defaultOffer([o('sangsan', 90), o('banovit', 100)], 'banovit')?.seller).toBe('banovit');
  });
  it('falls back to the cheapest in-stock seller', () => {
    expect(defaultOffer([o('banovit', 100, false), o('a', 120), o('b', 95)], 'banovit')?.seller).toBe('b');
  });
  it('shows Banovit (out of stock) when nobody has stock', () => {
    expect(defaultOffer([o('a', 80, false), o('banovit', 100, false)], 'banovit')?.seller).toBe('banovit');
  });
});
