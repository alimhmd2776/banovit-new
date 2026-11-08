import { describe, expect, it } from 'vitest';
import { vanityEstimate } from './VanityCalculator';

const rial = (amount: number) => ({ amount, currency: 'IRR' as const });
const calc = {
  kind: 'vanity' as const,
  title: 'محاسبه قیمت',
  frame_label: 'پایه و کلاف فلزی و پیشانی',
  min_length_cm: 100,
  max_length_cm: 400,
  width_cm: 55,
  min_bowls: 2,
  max_bowls: 6,
  slab_price_per_cm: rial(2_750_000),
  frame_price_per_cm: rial(1_000_000),
  bowl_price: rial(70_000_000),
};

describe('vanityEstimate (live form 41787)', () => {
  it('Calix, 200 cm, 2 bowls, with frame = 89,000,000 toman', () => {
    expect(vanityEstimate(calc, 200, 2, true)).toBe(890_000_000);
  });
  it('without frame uses the slab rate only', () => {
    expect(vanityEstimate(calc, 100, 2, false)).toBe(275_000_000 + 140_000_000);
  });
});
