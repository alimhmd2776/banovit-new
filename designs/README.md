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
| 07-sidebar-drawer-mobile.jpg | منوی ساید‌بار (drawer) — logo, search, محصولات (دسته بندی / تخفیف‌دار / پرفروش‌ترین / جدیدترین), دسترسی سریع (پیگیری سفارشات / تماس / مقالات / پنل کاربران), cart summary card, user account row | sidebar-drawer.jpg |

From the project chat uploads (2026-11-08).

## pdp/ — برگه تک محصول (mobile, 393px)

| File | Screen | Original export |
|---|---|---|
| 01-pdp-mobile.jpg | **Primary.** App bar (back, title «خرید محصول», voice search, wishlist) + section tabs (مشخصات / بررسی تخصصی / دیدگاه کاربران / پیشنهاد ما), gallery (main + side thumbs, counter), sheet: breadcrumb, H1, rating + views + «مشخصات فنی» chips, «نصب محصول توسط تیم فنی» card, variation pickers (مدل / رنگ with swatch / سایز, required *), spec chips row «مشخصات فنی کالا», seller box «خرید مطمئن از بانویت» (seller, satisfaction %, warranty, shipping & payment), «معرفی محصول» (collapsible), «مشخصات فنی محصول» table, «ویژگی های کلیدی», reviews summary + review card + «دیدگاه خود را ... ثبت کنید», «محصولات مرتبط» carousel (ProductCard), «بلاگ های مفید برای شما», «سوالات متداول» accordion, «آیا نیاز به تیم پشتیبانی دارید؟» callback form, footer, sticky price bar + «افزودن به سبد» | New.jpg |
| 02-pdp-mobile-alt.jpg | Earlier variant of the same page: no «معرفی محصول», specs as stacked rows instead of a table | PDP.jpg |

`pdp/slices/` holds the same two exports cut into 900px-tall overlapping parts (`01-partNN` = New.jpg, `02-partNN` = PDP.jpg) so they are readable at full resolution. From "Banovit interface 2.zip" (2026-11-08). No desktop frame was provided.

## auth/ — ورود / ثبت‌نام با موبایل و کد پیامکی (mobile, 393px)

| File | Screen | Original export |
|---|---|---|
| 01-splash-mobile.jpg | Splash — آبی، لوگو «بانُ»، «طراوتی نو در خانه نو» | Design-1.jpg |
| 02-phone-empty-mobile.jpg | «ورود یا ثبت نام در بانویت» — فیلد شماره موبایل خالی، شرایط/حریم خصوصی، دکمه غیرفعال «دریافت کد پیامکی» | Design.jpg |
| 03-phone-filled-mobile.jpg | same, number entered — field focused, button active | Design-2.jpg |
| 04-sending-otp-mobile.jpg | «درحال ارسال کد پیامکی ...» loading state | Design-3.jpg |
| 05-otp-empty-mobile.jpg | «کد پیامکی برای شما ارسال شد» — OTP boxes empty, disabled «ورود به بانویت», countdown «۰:۵۰ تا دریافت مجدد» | Design-6.jpg |
| 06-otp-filled-mobile.jpg | same, code entered — active button, «دریافت مجدد کد پیامکی» link | Design-7.jpg |
| 07-signup-name-empty-mobile.jpg | «به خانواده بانُویت خوش‌آمدید!» — new customer: نام کوچک* / نام خانوادگی* (empty) | Design-4.jpg |
| 08-signup-name-filled-mobile.jpg | same, filled (floating labels) | Design-5.jpg |

From "Banovit interface 3.zip" (2026-11-08). The OTP frames show 6 boxes, but per Ali the code is **4 digits** (same as the live site), so the UI renders 4. No desktop frame was provided — desktop is a centered card with the same content.

## account/ — حساب کاربری مشتری (mobile, 393px)

| File | Screen | Original export |
|---|---|---|
| 01-dashboard-home-mobile.jpg | پروفایل — داشبورد حساب: نام/موبایل، کارت‌های سفارشات من و پشتیبانی، منوی خرید و سفارش، خدمات بانویت | Design-25.jpg |
| 02-profile-info-verified-mobile.jpg | حساب کاربری — اطلاعات کاربری (تایید شده) و اطلاعات تماس، ویرایش | Design-1.jpg |
| 03-profile-info-identity-incomplete-mobile.jpg | حساب کاربری — بنر «احراز هویت شما تکمیل نیست» + ثبت اطلاعات شناسایی | Design-2.jpg |
| 04-orders-current-mobile.jpg | سفارش ها — تب جاری ها، کارت سفارش با وضعیت و نوار پیشرفت | Design-3.jpg |
| 05-orders-delivered-mobile.jpg | سفارش ها — تب تحویلی ها | Design-23.jpg |
| 06-orders-cancelled-mobile.jpg | سفارش ها — تب لغو ها (درحال بررسی / لغو شده - واریزی عودت شد) | Design-24.jpg |
| 07-orders-search-mobile.jpg | سفارش ها — جستجو با شماره سفارش | Design-4.jpg |
| 08-orders-empty-mobile.jpg | سفارش ها — خالی | Design-5.jpg |
| 09-order-detail-mobile.jpg | جزئیات سفارش — مراحل، اطلاعات تحویل گیرنده، اقلام، امتیازدهی، دریافت فاکتور | Design.jpg |
| 10-wishlist-empty-mobile.jpg | علاقه‌مندی ها — خالی | Design-26.jpg |
| 11-wishlist-filled-mobile.jpg | علاقه‌مندی ها — فهرست، سوییچ اطلاع رسانی، افزودن به سبد | Design-27.jpg |
| 12-recent-views-empty-mobile.jpg | بازدید های اخیر — خالی | Design-28.jpg |
| 13-recent-views-list-mobile.jpg | بازدید های اخیر — فهرست | Design-32.jpg |
| 14-recent-views-search-mobile.jpg | بازدید های اخیر — جستجو | Design-33.jpg |
| 15-reviews-list-mobile.jpg | دیدگاه های من — فهرست | Design-17.jpg |
| 16-reviews-list-alt-mobile.jpg | دیدگاه های من — فهرست (نسخه تکراری) | Design-18.jpg |
| 17-reviews-search-mobile.jpg | دیدگاه های من — جستجو | Design-21.jpg |
| 18-reviews-search-alt-mobile.jpg | دیدگاه های من — جستجو (نسخه تکراری) | Design-22.jpg |
| 19-reviews-empty-mobile.jpg | دیدگاه های من — خالی | Design-29.jpg |
| 20-reviews-empty-alt-mobile.jpg | دیدگاه های من — خالی (نسخه تکراری) | Design-30.jpg |
| 21-addresses-list-mobile.jpg | آدرس ها — فهرست با نقشه آدرس انتخاب‌شده، منوی ... | Design-19.jpg |
| 22-addresses-empty-mobile.jpg | آدرس ها — خالی | Design-31.jpg |
| 23-address-edit-mobile.jpg | ویرایش آدرس ها — نقشه، جزئیات، پلاک، واحد، عنوان | Design-20.jpg |
| 24-address-map-pick-mobile.jpg | انتخاب موقعیت مکانی — پین روی نقشه | Design-37.jpg |
| 25-address-map-search-mobile.jpg | انتخاب موقعیت مکانی — نتایج جستجو | Design-36.jpg |
| 26-notifications-empty-mobile.jpg | اعلانات من — خالی | Design-11.jpg |
| 27-notifications-list-mobile.jpg | اعلانات من — همه پیام (سفارشات، محصولات) | Design-38.jpg |
| 28-support-home-mobile.jpg | پشتیبانی بانویت — خانه و موضوعات راهنما | Design-6.jpg |
| 29-support-search-no-result-mobile.jpg | پشتیبانی — جستجو بدون نتیجه | Design-7.jpg |
| 30-support-topic-orders-mobile.jpg | سفارشات و پیگیری — متن راهنما + انتخاب سفارش | Design-12.jpg |
| 31-support-select-order-mobile.jpg | انتخاب سفارش | Design-13.jpg |
| 32-support-report-empty-mobile.jpg | ثبت گزارش — فرم خالی (توضیحات، محتوای عکسی) | Design-15.jpg |
| 33-support-report-filled-mobile.jpg | ثبت گزارش — فرم پر | Design-14.jpg |
| 34-support-report-success-mobile.jpg | ثبت گزارش موفق | Design-16.jpg |
| 35-support-tickets-in-review-mobile.jpg | پشتیبانی — تب درحال بررسی | Design-34.jpg |
| 36-support-tickets-in-review-empty-mobile.jpg | پشتیبانی — درحال بررسی خالی | Design-35.jpg |
| 37-support-tickets-resolved-mobile.jpg | پشتیبانی — تب بررسی شده | Design-8.jpg |
| 38-support-tickets-empty-mobile.jpg | پشتیبانی — بدون تیکت + تماس تلفنی | Design-9.jpg |
| 39-support-ticket-chat-mobile.jpg | گفتگوی تیکت (تاخیر در زمان ارسال) | Design-10.jpg |

From "Banovit interface 4.zip" (2026-11-08). The zip also had 10 files named `Order Title*.jpg` that are blank white images (likely a broken export); they are not committed. No desktop frames were provided.

## terms/ — «شرایط و قوانین» (mobile, 393px)

| File | Screen | Original export |
|---|---|---|
| 01-profile-menu-entry-mobile.png | پروفایل — entry point: «خدمات بانویت» → «قوانین و شرایط» (also پشتیبانی، اعلانات، درباره بانویت، فروشنده بانویت شوید) | Design.png |
| 02-terms-page-mobile.png | **Primary.** App bar «شرایط و قوانین» (back), logo, H «شرایط و مقررات فروشگاه این مجموعه» + intro, accordion of sections (one open), bottom nav | Design-2.png |
| 03-terms-sheet-mobile.png | same content as a full-height sheet «شرایط و قوانین بانویت» with close (X), e.g. opened from the login screen | Design-1.png |

From "Banovit interface 5.zip" (2026-11-08). No desktop frame — desktop is the same content in a centered column.

## shipping/ — «روش‌های ارسال» (mobile, 393px)

| File | Screen | Original export |
|---|---|---|
| 01-shipping-methods-mobile.png | **Primary.** Hero image + app bar «روش های ارسال», intro, «نحوه دریافت سفارش» (تحویل حضوری درب انبار / بانُویت بار، free-shipping note), «ارسال به شهرستان های کشور» (اتوبوسرانی / باربری rows → sheets), «ارسال رایگان» banner, «مراحل آماده‌سازی تا تحویل» 4-step timeline, «قوانین، تحویل و پیگیری سفارش» + «پیگیری سفارش» / «تماس با پشتیبانی» buttons, bottom nav | Design.png |
| 02-freight-sheet-mobile.png | sheet «ارسال باربری» — conditions + cost tiers | Design-1.png |
| 03-bus-sheet-mobile.png | sheet «ارسال اتوبوس رانی» — single/two-leg routes, costs, terminal notes | Design-2.png |

From "Banovit interface 7.zip" (2026-11-08). Info page for live `/shipping-methods/`, not the checkout shipping step. No desktop frame.

## about/ — «درباره شرکت بانُویت» (mobile, 393px)

| File | Screen | Original export |
|---|---|---|
| 01-about-mobile.jpg | Dark hero photo + app bar, logo, «به شرکت بانُویت خوش آمدید!»; About Banovit text; Company Values cards (icon/title/text); Team & Story text + group photo + two feature tiles; team-member carousel (photo/name/role); Partnership Brands logo row; Customer Review carousel (quote/avatar/name/rating label); bottom nav | Design 3.jpg |

From the project chat upload (2026-11-08). Live URL `/about-us/`. No desktop frame.
