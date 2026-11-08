/**
 * Static site chrome. Header menus now come from the CMS (GET /menus/{key},
 * features/menu); mainNav is only the fallback when the CMS is unreachable.
 * Footer still static until a /settings endpoint exists.
 */
export const siteConfig = {
  name: 'بانویت',
  supportPhone: '09927809601',
  supportPhoneDisplay: '۰۹۹۲۷۸۰۹۶۰۱',
  officePhone: '02191014093',
  officePhoneDisplay: '۰۲۱-۹۱۰۱۴۰۹۳',
  topBanner: { text: 'بسته بندی امن و چندلایه', href: '/shipping-methods/' },
  address: 'تهران، کارخانه نوآوری آزادی',
  about: 'پیشرو در ارائه انواع محصولات بهداشتی و آشپزخانه، متعهد به ارائه بهترین محصولات با کیفیت بالا برای خانه‌های شما.',
  // Same links and the same icon files as the live footer.
  social: [
    { name: 'آپارات', href: 'https://www.aparat.com/banovit', icon: 'https://banovit.com/wp-content/uploads/2024/07/aparat-social.svg' },
    { name: 'اینستاگرام', href: 'https://instagram.com/banovit', icon: 'https://banovit.com/wp-content/uploads/2024/07/insta-social.svg' },
    { name: 'تلگرام', href: 'https://t.me/banovitcom', icon: 'https://banovit.com/wp-content/uploads/2024/08/Vector-1.svg' },
    { name: 'واتساپ', href: 'https://wa.me/+989927809601', icon: 'https://banovit.com/wp-content/uploads/2024/08/Vector-2.svg' },
    { name: 'روبیکا', href: 'https://rubika.ir/banovit', icon: 'https://banovit.com/wp-content/uploads/2022/05/rubika-icon.png' },
  ],
  enamad: {
    href: 'https://trustseal.enamad.ir/?id=516602&Code=bEu3ObZADXWU4nC4jLQ10pdhqFhN3ehP',
    img: 'https://trustseal.enamad.ir/logo.aspx?id=516602&Code=bEu3ObZADXWU4nC4jLQ10pdhqFhN3ehP',
  },
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
  footerColumns: [
    {
      title: 'دسترسی سریع',
      links: [
        { name: 'درباره ما', href: '/about-us/' },
        { name: 'تماس با ما', href: '/contact-us/' },
        { name: 'روش‌های ارسال', href: '/shipping-methods/' },
        { name: 'روش‌های پرداخت و اقساط', href: '/payment-methods-and-installments/' },
        { name: 'پیگیری سفارش', href: '/track-order/' },
        { name: 'پیوستن به همکاران', href: '/landing/b2b/' },
        { name: 'حریم خصوصی', href: '/privacy-policy/' },
      ],
    },
    {
      title: 'دسته‌بندی فروشگاه',
      links: [
        { name: 'روشویی', href: '/shop/category/vanity/' },
        { name: 'شیرآلات', href: '/shop/category/faucets/' },
        { name: 'توالت', href: '/shop/category/toilet/' },
        { name: 'کاسه روشویی', href: '/shop/category/sink/' },
        { name: 'سینک ظرفشویی', href: '/shop/category/kitchen-sink/' },
        { name: 'هود آشپزخانه', href: '/shop/category/kitchen-hood/' },
        { name: 'اجاق گاز', href: '/shop/category/stove/' },
      ],
    },
  ],
} as const;
