import { describe, expect, it } from 'vitest';
import type { MenuItem } from '@banovit/api-client';
import { countLabel, groupsOf, normalizeFa, searchMenu } from './menu-model';

let seq = 0;
const item = (title: string, children: MenuItem[] = [], count: number | null = 10): MenuItem => ({
  id: ++seq,
  title,
  url: `/shop/category/${seq}/`,
  image: null,
  icon: null,
  product_count: count,
  highlight: false,
  promo: null,
  children,
});

const tree = [
  item('روشویی', [item('روشویی کابینتی', [item('فولست ارزان'), item('روشویی پی وی سی')]), item('روشویی اکونومی'), item('روشویی لاکچری')]),
  item('کاسه روشویی', [item('کاسه روشویی سنگی')]),
  item('شیرآلات', [item('دوش حمام'), item('شیرآلات ظرفشویی', [item('شیر ظرفشویی شودر')])]),
];

describe('groupsOf', () => {
  it('puts flat children in a leading group named after the top, then one group per nested child', () => {
    const groups = groupsOf(tree[0]!);
    expect(groups.map((g) => g.title)).toEqual(['روشویی', 'روشویی کابینتی']);
    expect(groups[0]!.items.map((i) => i.title)).toEqual(['روشویی اکونومی', 'روشویی لاکچری']);
    expect(groups[0]!.url).toBe(tree[0]!.url);
    expect(groups[1]!.items).toHaveLength(2);
  });
});

describe('searchMenu', () => {
  it('returns matching tops and deduplicated subcategories from any level', () => {
    const r = searchMenu(tree, 'روشويي'); // Arabic yeh
    expect(r.tops.map((t) => t.title)).toEqual(['روشویی', 'کاسه روشویی']);
    expect(r.subs.map((t) => t.title)).toEqual(['روشویی کابینتی', 'روشویی پی وی سی', 'روشویی اکونومی', 'روشویی لاکچری', 'کاسه روشویی سنگی']);
  });

  it('ignores spaces and ZWNJ and returns nothing for an empty query', () => {
    expect(searchMenu(tree, 'شیر‌ظرفشویی').subs.map((s) => s.title)).toEqual(['شیر ظرفشویی شودر']);
    expect(searchMenu(tree, 'روشوییکابینتی').subs.map((s) => s.title)).toEqual(['روشویی کابینتی']);
    expect(searchMenu(tree, '  ')).toEqual({ tops: [], subs: [] });
    expect(searchMenu(tree, 'حال کنید کار کنید')).toEqual({ tops: [], subs: [] });
  });
});

describe('format', () => {
  it('normalizes and labels counts in Persian digits', () => {
    expect(normalizeFa('كاسه  روشويي')).toBe('کاسه روشویی');
    expect(countLabel(435)).toBe('۴۳۵ محصول');
    expect(countLabel(null)).toBeNull();
  });
});
