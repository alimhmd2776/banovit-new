import { describe, expect, it } from 'vitest';
import { DEFAULT_TEXTS, fill, resolveTexts } from './header-texts';

describe('header texts', () => {
  it('uses CMS values and falls back to defaults for empty or missing keys', () => {
    const t = resolveTexts({ sheet_title: 'دسته‌ها', sheet_subtitle: '  ', unknown: 'x' });
    expect(t.sheet_title).toBe('دسته‌ها');
    expect(t.sheet_subtitle).toBe(DEFAULT_TEXTS.sheet_subtitle);
    expect(resolveTexts(null).login).toBe(DEFAULT_TEXTS.login);
    expect('unknown' in t).toBe(false);
  });

  it('fills :count and :query placeholders', () => {
    expect(fill(':count محصول در سبد!', { count: '۲' })).toBe('۲ محصول در سبد!');
    expect(fill('نتیجه جستجو ":query"', { query: 'روشویی' })).toBe('نتیجه جستجو "روشویی"');
    expect(fill('بدون :other', {})).toBe('بدون :other');
  });
});
