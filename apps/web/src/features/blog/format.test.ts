import { describe, expect, it } from 'vitest';
import { faDate, internalHref, localizeLinks, postPagePath } from './format';

describe('blog format', () => {
  it('formats Jalali dates with Persian digits', () => {
    expect(faDate('2025-07-03T08:00:00Z')).toBe('۱۲ تیر ۱۴۰۴');
    expect(faDate(null)).toBe('');
  });

  it('keeps internal links inside the new site', () => {
    expect(internalHref('https://banovit.com/shop/a/')).toBe('/shop/a/');
    expect(internalHref('https://www.banovit.com/blog/x/')).toBe('/blog/x/');
    expect(internalHref('https://digikala.com/x/')).toBe('https://digikala.com/x/');
    expect(localizeLinks('<a href="https://banovit.com/blog/x/">x</a><img src="https://banovit.com/wp-content/a.jpg">')).toBe(
      '<a href="/blog/x/">x</a><img src="https://banovit.com/wp-content/a.jpg">',
    );
  });

  it('builds WordPress-style pagination paths', () => {
    expect(postPagePath('/blog/category/toilet/', 1)).toBe('/blog/category/toilet/');
    expect(postPagePath('/blog/category/toilet/', 3)).toBe('/blog/category/toilet/page/3/');
  });
});
