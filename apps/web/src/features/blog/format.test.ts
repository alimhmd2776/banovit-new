import { describe, expect, it } from 'vitest';
import { faDate, internalHref, localizeLinks, mainHeadings, postPagePath } from './format';

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

describe('mainHeadings', () => {
  it('keeps only h2 and appends the FAQ section', () => {
    const items = [
      { id: 'a', text: 'A', level: 2 },
      { id: 'a1', text: 'A1', level: 3 },
      { id: 'b', text: 'B', level: 2 },
    ];
    expect(mainHeadings(items, 'سوالات متداول').map((i) => i.id)).toEqual(['a', 'b', 'post-faq']);
  });
  it('falls back to the top level when a post has no h2', () => {
    expect(mainHeadings([{ id: 'x', text: 'X', level: 3 }]).map((i) => i.id)).toEqual(['x']);
  });
});
