/**
 * Static site chrome until the CMS menu/settings endpoints exist (header/footer
 * thread will replace this with GET /storefront/v1/menus + /settings).
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
  social: [
    { name: 'اینستاگرام', href: 'https://instagram.com/banovit', icon: 'instagram' },
    { name: 'تلگرام', href: 'https://t.me/banovitcom', icon: 'telegram' },
    { name: 'واتساپ', href: 'https://wa.me/+989927809601', icon: 'whatsapp' },
    { name: 'آپارات', href: 'https://www.aparat.com/banovit', icon: 'aparat' },
  ],
  enamad: {
    href: 'https://trustseal.enamad.ir/?id=516602&Code=bEu3ObZADXWU4nC4jLQ10pdhqFhN3ehP',
    img: 'https://trustseal.enamad.ir/logo.aspx?id=516602&Code=bEu3ObZADXWU4nC4jLQ10pdhqFhN3ehP',
  },
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
