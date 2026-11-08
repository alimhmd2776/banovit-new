/**
 * Static site chrome until the CMS menu/settings endpoints exist (header/footer
 * thread will replace this with GET /storefront/v1/menus + /settings).
 */
export const siteConfig = {
  name: 'بانویت',
  supportPhone: '09927809601',
  supportPhoneDisplay: '۰۹۹۲۷۸۰۹۶۰۱',
  topBanner: { text: 'ارسال به سراسر کشور و خدمات نصب در تهران', href: '/shipping-methods/' },
  mainNav: [
    { name: 'روشویی', href: '/shop/category/vanity/' },
    { name: 'شیرآلات', href: '/shop/category/faucets/' },
    { name: 'توالت', href: '/shop/category/toilet/' },
    { name: 'سینک', href: '/shop/category/sink/' },
    { name: 'هود', href: '/shop/category/kitchen-hood/' },
    { name: 'اجاق گاز', href: '/shop/category/stove/' },
    { name: 'آینه', href: '/shop/category/bathroom-mirror/' },
    { name: 'بلاگ', href: '/blog/' },
  ],
  footerColumns: [
    {
      title: 'خرید از بانویت',
      links: [
        { name: 'روش‌های ارسال', href: '/shipping-methods/' },
        { name: 'روش‌های پرداخت و اقساط', href: '/payment-methods-and-installments/' },
        { name: 'پیگیری سفارش', href: '/track-order/' },
        { name: 'پیوستن به همکاران', href: '/landing/b2b/' },
      ],
    },
    {
      title: 'بانویت',
      links: [
        { name: 'درباره ما', href: '/about-us/' },
        { name: 'تماس با ما', href: '/contact-us/' },
        { name: 'حریم خصوصی', href: '/privacy-policy/' },
        { name: 'بلاگ', href: '/blog/' },
      ],
    },
  ],
} as const;
