/**
 * Static site chrome. Header menus now come from the CMS (GET /menus/{key},
 * features/menu); mainNav is only the fallback when the CMS is unreachable.
 * Footer, top banner and PLP texts come from the CMS («صفحه فروشگاه و فوتر», GET /settings/listing).
 */
export const siteConfig = {
  name: 'بانویت',
  supportPhone: '09927809601',
  supportPhoneDisplay: '۰۹۹۲۷۸۰۹۶۰۱',
  /** Desktop header top bar (designs/menu/01). */
  supportPhones: [
    { tel: '09927809601', display: '۰۹۹۲۷۸۰۹۶۰۱' },
    { tel: '02191014093', display: '۰۲۱-۹۱۰۱۴۰۹۳' },
  ],
  supportHours: 'شنبه تا چهارشنبه ۹ تا ۱۷ پنجشنبه تا ۱۴',
  mainNav: [
    { name: 'روشویی', href: '/shop/category/vanity/' },
    { name: 'شیرآلات', href: '/shop/category/faucets/' },
    { name: 'توالت', href: '/shop/category/toilet/' },
    { name: 'کاسه روشویی', href: '/shop/category/sink/' },
    { name: 'سینک', href: '/shop/category/kitchen-sink/' },
    { name: 'هود', href: '/shop/category/kitchen-hood/' },
    { name: 'اجاق گاز', href: '/shop/category/stove/' },
    { name: 'آینه', href: '/shop/category/bathroom-mirror/' },
    { name: 'مقالات', href: '/blog/' },
  ],
} as const;
