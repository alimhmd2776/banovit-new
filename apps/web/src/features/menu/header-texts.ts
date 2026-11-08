/**
 * UI copy of the header, mega menu, mobile drawer and category sheet. The CMS
 * («تنظیمات هدر», GET /settings/header → texts) overrides any key; these are
 * only the fallback when a key is empty or the CMS is unreachable (same values
 * as the CMS defaults, which come from the WordPress header).
 */
export const DEFAULT_TEXTS = {
  search_placeholder: 'جستجو در بانویت…',
  mega_menu_trigger: 'دسته بندی کالاها',
  welcome: 'خوش‌آمدید!',
  login: 'ورود / ثبت‌نام',
  drawer_search_placeholder: 'جستجو محصولات ...',
  drawer_products_title: 'محصولات',
  drawer_categories_link: 'دسته بندی',
  drawer_quick_title: 'دسترسی سریع',
  drawer_cart_title: 'سبد خرید',
  drawer_cart_count: ':count محصول در سبد!',
  drawer_cart_hint: 'جهت مشاهده سبدخرید کلیک کنید',
  drawer_account_hint: 'حساب کاربری من',
  sheet_title: 'دسته‌بندی محصولات',
  sheet_subtitle: 'گردشگری سریعتر محصولات در فروشگاه',
  sheet_search_placeholder: 'جستجو دسته‌بندی موردنظر',
  sheet_view_all: 'مشاهده همه',
  sheet_results_title: 'نتیجه جستجو ":query"',
  sheet_found_subcategories: 'زیر دسته های یافت شده',
  sheet_empty_title: 'دسته بندی با عنوان ":query" یافت نشد',
  sheet_empty_hint: 'مجددا در نوشتاری جست‌وجو خود دقت فرمایید.',
  sheet_empty_image: '',
  count_suffix: 'محصول',
} as const;

export type HeaderTexts = Record<keyof typeof DEFAULT_TEXTS, string>;

export function resolveTexts(fromCms: Record<string, string | null> | null | undefined): HeaderTexts {
  const out = { ...DEFAULT_TEXTS } as HeaderTexts;
  for (const k of Object.keys(DEFAULT_TEXTS) as (keyof HeaderTexts)[]) {
    const v = fromCms?.[k];
    if (typeof v === 'string' && v.trim() !== '') out[k] = v;
  }
  return out;
}

/** Fills :count / :query placeholders. */
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/:(\w+)/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}
