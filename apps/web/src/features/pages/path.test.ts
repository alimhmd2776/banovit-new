import { describe, expect, it } from 'vitest';
import { toPagePath } from './path';

describe('toPagePath', () => {
  it('maps URL segments to the CMS path, decoded and lowercased', () => {
    expect(toPagePath(['about-us'])).toBe('about-us');
    expect(toPagePath(['Landing', 'B2B'])).toBe('landing/b2b');
    expect(toPagePath(['%D9%BE%DB%8C%D8%B4-%D9%81%D8%A7%DA%A9%D8%AA%D9%88%D8%B1'])).toBe('پیش-فاکتور');
  });

  it('rejects things that are never pages (files, probes, deep paths)', () => {
    expect(toPagePath([])).toBeNull();
    expect(toPagePath(['wp-login.php'])).toBeNull();
    expect(toPagePath(['.env'])).toBeNull();
    expect(toPagePath(['a', 'b', 'c', 'd', 'e'])).toBeNull();
    expect(toPagePath(['x"onload'])).toBeNull();
  });
});
