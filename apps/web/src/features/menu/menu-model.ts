import type { MenuItem } from '@banovit/api-client';

/**
 * View model for the category menu (CMS menu "categories"):
 * level 1 = top category, level 2 = group header («مشاهده همه»), level 3 = items.
 * A level-2 item without children is a plain subcategory: those are collected
 * into one leading group titled with the top category itself, so a top with
 * only flat children (e.g. شیرآلات) renders as a single group like the design.
 */
export interface MenuGroup {
  id: number;
  title: string;
  url: string;
  items: MenuItem[];
}

export function groupsOf(top: MenuItem): MenuGroup[] {
  const flat = top.children.filter((c) => c.children.length === 0);
  const nested = top.children.filter((c) => c.children.length > 0);
  const groups: MenuGroup[] = [];
  if (flat.length) groups.push({ id: top.id, title: top.title, url: top.url, items: flat });
  for (const g of nested) groups.push({ id: g.id, title: g.title, url: g.url, items: g.children });
  return groups;
}

/** Folds Arabic/Persian letter variants, ZWNJ, diacritics and spacing so «روشویي» matches «روشویی». */
export function normalizeFa(s: string): string {
  return s
    .replace(/[يى]/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[ۀة]/g, 'ه')
    .replace(/[أإآ]/g, 'ا')
    .replace(/[ً-ٰٟ]/g, '')
    .replace(/[‌‏‎\-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

export interface MenuSearchResult {
  tops: MenuItem[];
  subs: MenuItem[];
}

/**
 * Category search in the mobile sheet: matching top categories, then matching
 * subcategories from any depth (deduplicated by URL). Spaces are ignored so
 * «روشویی کابینتی» and «روشوییکابینتی» both match.
 */
export function searchMenu(items: MenuItem[], query: string): MenuSearchResult {
  const q = normalizeFa(query).replace(/ /g, '');
  if (!q) return { tops: [], subs: [] };
  const hit = (i: MenuItem) => normalizeFa(i.title).replace(/ /g, '').includes(q);
  const tops = items.filter(hit);
  const seen = new Set(tops.map((t) => t.url));
  const subs: MenuItem[] = [];
  const walk = (list: MenuItem[]) => {
    for (const i of list) {
      if (hit(i) && !seen.has(i.url)) {
        seen.add(i.url);
        subs.push(i);
      }
      walk(i.children);
    }
  };
  items.forEach((t) => walk(t.children));
  return { tops, subs };
}

const faNumber = new Intl.NumberFormat('fa-IR');

/** «۴۳۵ محصول», or null when the CMS hides the count. */
export function countLabel(n: number | null | undefined): string | null {
  return n == null ? null : `${faNumber.format(n)} محصول`;
}

export function isExternal(url: string): boolean {
  return /^https?:\/\//i.test(url);
}
