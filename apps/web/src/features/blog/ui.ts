import type { BlogUi } from '@banovit/api-client';

/**
 * Blog texts and switches set in the CMS panel (GET /blog/ui), filled up with
 * the CMS's own defaults (config/blog.php) so a missing key or an unreachable
 * CMS still renders the live site's wording.
 */
export const BLOG_UI_DEFAULTS = {
  labels: {
    title_prefix: 'گردشگری',
    title_accent: 'مقالات',
    all_tab: 'همه مقالات',
    breadcrumb_root: 'مقالات',
    search_placeholder: 'جستجوی مقاله …',
    categories_title: 'دسته‌بندی مقالات',
    empty: 'مقاله‌ای پیدا نشد.',
    more: 'مطالب بیشتر',
    featured_title: 'مقالات ویژه',
    feed_description: 'راهنمای خرید، مقایسه و آموزش شیرآلات، روشویی، سینک و لوازم آشپزخانه',
    search_title: 'نتایج جستجو برای «{q}»',
    tag_title: 'برچسب: {name}',
  },
  post_page: {
    show_summary: true,
    summary_title: 'خلاصه مقاله',
    show_tags: true,
    show_author_box: true,
    faq_title: 'سوالات متداول',
    related_products: { enabled: true, title: 'محصولات مرتبط', subtitle: 'انتخاب خریداران بانویت', limit: 0 },
    related_posts: { enabled: true, title: 'مطالب مرتبط', subtitle: 'Related', limit: 4 },
    share: {
      enabled: true,
      title: 'اشتراک گذاری:',
      items: [
        { type: 'copy', url: null },
        { type: 'telegram', url: null },
        { type: 'whatsapp', url: null },
      ] as { type: 'copy' | 'telegram' | 'whatsapp' | 'instagram' | 'aparat'; url: string | null }[],
    },
    toc: { title: 'فهرست مطالب', mobile_floating: true, include_faq: true, collapse_after_px: 170, more: 'مشاهده بیشتر', less: 'مشاهده کمتر' },
  },
  blocks: {
    map: { label: 'موقعیت روی نقشه', link: 'نمایش نقشه بزرگ‌تر' },
    stat: { views: 'تعداد بازدید:', updated: 'آخرین بروزرسانی:' },
  },
};

export type ResolvedBlogUi = typeof BLOG_UI_DEFAULTS;

function fill<T>(base: T, over: unknown): T {
  if (over === null || over === undefined) return base;
  if (Array.isArray(base)) return (Array.isArray(over) ? over : base) as T;
  if (typeof base === 'object' && base !== null && typeof over === 'object') {
    const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
    for (const [k, v] of Object.entries(over as Record<string, unknown>)) {
      out[k] = k in out ? fill(out[k], v) : v;
    }
    return out as T;
  }
  // empty strings from the panel fall back to the default text
  return (over === '' ? base : over) as T;
}

export function resolveBlogUi(ui: BlogUi | null | undefined): ResolvedBlogUi {
  return fill(BLOG_UI_DEFAULTS, ui ?? null);
}

/** "نتایج جستجو برای «{q}»" + {q: 'سینک'} */
export function fillTemplate(t: string, vars: Record<string, string | number>): string {
  return t.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}
