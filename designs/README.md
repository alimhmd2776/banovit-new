# Design exports

Static design exports (JPG) so that every thread / machine can read them from git.

## cart/ — «سبد خرید من» flow (mobile, 393px)

| File | Screen | Original export |
|---|---|---|
| 01-cart-filled-mobile.jpg | سبدخرید من — list, qty stepper, install toggle, sticky «تکمیل سفارش» | Design-5.jpg |
| 02-cart-empty-mobile.jpg | سبد خرید خالی | Design-6.jpg |
| 03-checkout-shipping-mobile.jpg | تکمیل اطلاعات — address, delivery day slots, packaging + installation add-ons, order items | Design.jpg |
| 04-checkout-shipping-no-address-mobile.jpg | same, no address saved / items without installation service | Design-1.jpg |
| 05-address-map-pick-mobile.jpg | انتخاب موقعیت مکانی — map pin | Design-4.jpg |
| 06-address-map-search-mobile.jpg | انتخاب موقعیت مکانی — search results sheet | Design-3.jpg |
| 07-checkout-payment-mobile.jpg | اطلاعات پرداخت — gateway, coupon, payment breakdown, پیش‌فاکتور | Design-2.jpg |
| 08-payment-success-mobile.jpg | پرداخت موفق | Design-7.jpg |
| 09-payment-failed-mobile.jpg | پرداخت ناموفق | Design-8.jpg |

The uploaded zip ("Banovit interface.zip", 2026-11-08) contained only these 9 cart/checkout screens; other sections will go in sibling folders (designs/<section>/) when they are exported. No desktop frames were provided — desktop is derived from the mobile layout.

## contact/ — «تماس با ما» (desktop 1440px + mobile 393px)

| File | Screen | Original export |
|---|---|---|
| 01-contact-desktop.png | تماس با ما — header, پشتیبانی بانویت intro + ساعت پاسخگویی, info cards (انبار / شرکت / تلفن), map with «ورود به نشان», فرم «درخواست مشاوره», social icons, footer CTA | Contact us - Desktop.png |
| 02-contact-mobile.png | same, mobile: app bar «تماس با ما», form first, info cards, map, hours, footer, bottom nav | Contact us - Mobile.png |

From "Banovit interface 1.zip" (2026-11-08).

## plp/ — برگه فروشگاه / دسته‌بندی محصولات (PLP, mobile 393px)

| File | Screen | Original export |
|---|---|---|
| 01-plp-full-mobile.jpg | کابینت روشویی — full page: banner, breadcrumb, sub-category chips, sort/filter/brand/price chips, active filter tags, product cards (rating, discount, price, color dots), bottom nav | Product Details.jpg |
| 02-plp-on-scroll-mobile.jpg | same, scrolled — sticky title + filter chip bar | Product Details _ON Scroll.jpg |
| 03-plp-no-results-mobile.jpg | no results with active filters — «محصولی با این مشخصات پیدا نکردیم» + «تغییر فیلتر» | Product Details _ON Scroll 1.jpg |
| 04-sort-sheet-mobile.png | مرتب‌سازی bottom sheet | Sortby Sheet.png |
| 05-filter-sheet-mobile.png | فیلتر bottom sheet (filter list) | Filter Sheet.png |
| 06-filter-brand-mobile.png | فیلتر → برند | Product Brand.png |
| 07-filter-color-mobile.png | فیلتر → رنگ | Product Color.png |
| 08-filter-price-range-mobile.png | فیلتر → بازه قیمت | Product Price Range.png |

## menu/ — هدر، مگامنو و دسته‌بندی‌ها

Must be implemented against the final version of the menu/category plugin installed on WordPress stage2.

| File | Screen | Original export |
|---|---|---|
| 01-header-mega-menu-desktop.jpg | Desktop header + open mega menu | Desktop.jpg |
| 02-category-sheet-root-mobile.png | دسته‌بندی محصولات sheet — search + top-level categories with counts | Mega Category.png |
| 03-category-sheet-subcategories-mobile.png | level 2 (e.g. شیرآلات) — sub-categories + «مشاهده همه» + promo banner | Mega Category 1.png |
| 04-category-sheet-subcategory-groups-mobile.png | level 2 with grouped sub-categories (several «عنوان دسته» groups) | Mega Category 2.png |
| 05-category-search-results-mobile.png | category search results («نتیجه جستجو "روشویی"») | Mega Category 3.png |
| 06-category-search-empty-mobile.png | category search, no result | Mega Category 4.png |

From the project chat uploads (2026-11-08).

## pdp/ — برگه تک محصول (mobile, 393px)

| File | Screen | Original export |
|---|---|---|
| 01-pdp-mobile.jpg | **Primary.** App bar (back, title «خرید محصول», voice search, wishlist) + section tabs (مشخصات / بررسی تخصصی / دیدگاه کاربران / پیشنهاد ما), gallery (main + side thumbs, counter), sheet: breadcrumb, H1, rating + views + «مشخصات فنی» chips, «نصب محصول توسط تیم فنی» card, variation pickers (مدل / رنگ with swatch / سایز, required *), spec chips row «مشخصات فنی کالا», seller box «خرید مطمئن از بانویت» (seller, satisfaction %, warranty, shipping & payment), «معرفی محصول» (collapsible), «مشخصات فنی محصول» table, «ویژگی های کلیدی», reviews summary + review card + «دیدگاه خود را ... ثبت کنید», «محصولات مرتبط» carousel (ProductCard), «بلاگ های مفید برای شما», «سوالات متداول» accordion, «آیا نیاز به تیم پشتیبانی دارید؟» callback form, footer, sticky price bar + «افزودن به سبد» | New.jpg |
| 02-pdp-mobile-alt.jpg | Earlier variant of the same page: no «معرفی محصول», specs as stacked rows instead of a table | PDP.jpg |

`pdp/slices/` holds the same two exports cut into 900px-tall overlapping parts (`01-partNN` = New.jpg, `02-partNN` = PDP.jpg) so they are readable at full resolution. From "Banovit interface 2.zip" (2026-11-08). No desktop frame was provided.
