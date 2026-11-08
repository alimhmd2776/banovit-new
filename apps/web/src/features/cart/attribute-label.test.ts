import { describe, expect, it } from 'vitest';
import { attributeLabel } from './CartLineCard';

describe('attributeLabel', () => {
  it('prefixes the attribute name', () => expect(attributeLabel('رنگ', 'سفید')).toBe('رنگ سفید'));
  it('does not repeat a word already in the value', () => expect(attributeLabel('درجه کیفیت', 'درجه دو')).toBe('درجه دو'));
});
