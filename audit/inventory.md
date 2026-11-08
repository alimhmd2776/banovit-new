# فهرست سایت فعلی (Inventory)

تاریخ ممیزی: ۲۰۲۶-۱۱-۰۸، فقط خواندنی (wp-cli و کوئری SELECT). خروجی خام در `audit/raw/` (خارج از گیت، شامل کلیدها).

## ۱. لایو: banovit.com (45.94.213.49، DirectAdmin، کاربر adminbano)

- WordPress 7.1.4، WooCommerce 10.8.1 با HPOS، پیشوند جدول `wp_bv`، قالب hello-elementor 3.4.6 + Elementor Pro (child theme غیرفعال)
- Redis object cache + WP Super Cache، پشت Arvan CDN، ModSecurity/CRS روی Apache
- دیتابیس کوچک است: postmeta حدود ۳۲۰ مگابایت، posts حدود ۲۰۰ مگابایت، بقیه زیر ۵۰ مگابایت

### محتوا

| نوع | منتشرشده | توضیح |
|---|---|---|
| product | 1534 (+312 پیش‌نویس، 16 خصوصی) | 2697 تنوع (variation)، ۱۹۴۹ محصول با `_product_attributes` |
| post (بلاگ) | 237 | همه با Elementor ساخته شده‌اند؛ ۲۱۵ تا شورت‌کد دارند |
| page | 20 | لیست پایین |
| attachment | 12789 | ۱۱۶۳۸ با alt؛ `_wcji_source_url` و `_source_url` یعنی بخشی import شده |
| cms_block / woodmart_* | 76 / 35 | باقیمانده قالب Woodmart قدیمی؛ ممکن است هنوز جایی رندر شوند |
| elementor_library | 16 | قالب‌های هدر/فوتر/آرشیو |
| order (HPOS) | ~2137 | 1676 completed، 447 cancelled، 26 processing |
| comment | 59 نظر بلاگ، ۱۱ review محصول، 20832 order_note | |
| کاربران | 609 customer، 207 `shop` (همکار/B2B)، 53 subscriber، ~15 ادمین | نقش‌های ERP و «مالی» هم هست |

### برگه‌ها (Pages)

| ID | slug | عنوان | نکته |
|---|---|---|---|
| 41150 | homev2 | صفحه اصلی | front page (`/`) |
| 1358 | shop | فروشگاه | آرشیو محصولات `/shop/` |
| 10 / 11 / 12 | cart / checkout / my-account | | ووکامرس |
| 2293 | blog | وبلاگ | |
| 2360 | قالب-وبلاگ | قالب وبلاگ | page_for_posts |
| 38659 | login | ورود | OTP (collection-festival 3.6) |
| 40237 | login-b2b | ورود همکاران | |
| 38482 | b2b | پنل همکاران | |
| 39059 | landing/b2b | پیوستن به همکاران | parent 25859 = landing |
| 35566 | landing/bulk-collection | کمپین بانویت و کالکشن | |
| 5265 | پیش-فاکتور-سبد-خرید | پیش فاکتور | قالب `pre-invoice.php` |
| 289, 287, 281, 279, 275, 1562 | track-order، shipping-methods، payment-methods-and-installments، contact-us، about-us، privacy-policy | | محتوای ثابت |
| 4986 | image-licence | | |

### Taxonomy

- `product_cat`: ۵۶ ترم، سلسله‌مراتبی (هود، روشویی، کاسه روشویی، شیرآلات، سینک، توالت، اجاق گاز، ...). URL کانونیکال لایو تخت است: `/shop/category/{slug}/`. FAQ هر دسته در term meta `_faqs`، و فیلترهای مخصوص هر دسته در option `cwa_category_filter_rules` (هر دو باید منتقل شوند).
- عنوان‌های Yoast روی test2 از لایو قدیمی‌ترند؛ متای سئو فقط از لایو منتقل شود.
- `pa_*`: ۷۹ ویژگی محصول (رنگ، ارتفاع، ابعاد، جنس، ...)، همه public با آرشیو `/{attr}/{term}/`. فقط `pa_brand` (۳۵ برند، آدرس `/brand/{slug}/`) در نقشه سایت است.
- `product_brand`: ۱ ترم (`/brands/{slug}/`)، عملاً بلااستفاده؛ برند واقعی = `pa_brand`
- `product_tag`: ۱۶، `category` بلاگ: ۲۱، `post_tag`: ۲
- `state_city`: ۱۴۲۵ ترم (استان/شهر افزونه حمل‌ونقل PWS)

### سئو

- Yoast SEO 27 + Premium؛ indexables: 1950 محصول، 965 نوشته، ۵۰ دسته با عنوان/توضیح سفارشی، ۲۵ برند
- متا روی محصولات: `_yoast_wpseo_focuskeywords` (۱۹۸۰)، `primary_product_cat` (۱۹۴۳)، `primary_product_brand` (۱۶۳۳)
- `_wp_old_slug`: ۱۴۸۰ ردیف، یعنی ۱۴۸۰ ریدایرکت خودکار وردپرس از slug قدیمی (باید منتقل شوند)
- ۱۸۱ ریدایرکت Yoast (۱۷۷ تا 301، ۴ تا 410) در `audit/data/yoast-redirects.json`
- نقشه سایت Yoast در `/sitemap_index.xml`: post 225، page 15، product 1517 (دو فایل)، category 19، product_cat 50، product_tag 16، pa_brand 27، author 3
- اسکیما: Schema Pro (Product 2441، Review 2440، FAQ 2436، LocalBusiness 2438، ImageLicense 2442) با فیلدهای per-post، به‌اضافه mu-plugin `banovit-product-schema-fix`، YASR فقط برای پست‌ها
- robots.txt سفارشی، و mu-plugin `banovit-filter-seo` (noindex,follow روی URLهای فیلتر با canonical تمیز)
- permalink نوشته‌ها: `/blog/%postname%/`، محصول: `/shop/{slug}/`، دسته محصول: `/shop/category/...`، برچسب: `/shop/tag/...`، دسته بلاگ: `/blog/category/...`

### افزونه‌ها و قابلیت‌هایی که باید در سیستم جدید بازسازی شوند

| قابلیت | منبع فعلی | مقصد پیشنهادی |
|---|---|---|
| فیلتر پیشرفته محصولات (cwa_*، filter_*) | banovit-advanced-woocommerce-filters 1.5.4 | موتور جستجو/facet در CMS + UI در web |
| دستیار هوش مصنوعی فروش | banovit-ai-assistant 0.1.7 (REST `banovit-ai/v1`) | سرویس CMS + ویجت web |
| attribution سفارش (utm/gclid → CMS) | banovit-attribution 1.1.2 + mu-plugins measurement | ماژول attribution در CMS (جدول‌ها از قبل هست) |
| زمان‌بندی ارسال و نصب | banovit-delivery-installation 1.6.2 | ماژول checkout در CMS |
| اندازه‌گیری GA4/Matomo/GTM/Ads + outbox | banovit-measurement 0.4.1، ۵ mu-plugin | dataLayer استاندارد در web + outbox سمت سرور CMS |
| ورود OTP چهاررقمی، جشنواره کالکشن | collection-festival 3.6.1، Digits (جدول‌های لاگ) | auth مشتری در CMS (OTP پیامکی) |
| تخفیف پلکانی و همکاری برند | festival-discount 6.2 | موتور قیمت/تخفیف در CMS |
| فیلدهای checkout | woo-checkout-field-editor-pro | فرم checkout در web |
| افزودنی محصول (addons، مثل سیفون/نصب) | Rico-wc-addons (`cwa_addon_group`، `_cwa_enable_addons`) | مدل product_addons در CMS |
| نظرات و امتیاز | Rico-comment، YASR | reviews در CMS |
| فرم‌ها (مشاوره رایگان، تماس با ما) | form-builder (جدول `cf_forms`) + Elementor submissions (۲۸۵) | ماژول forms → لید در CMS (SalesLead موجود) |
| پیامک سفارش | wp-sms 7.1، persian-woocommerce-sms (آرشیو ۵۵۸۹) | NotificationTemplate موجود در CMS |
| حمل‌ونقل و نقشه | persian-woocommerce-shipping (+pro)، وضعیت‌های pws-* | ماژول shipping در CMS (ShipmentBasket موجود) |
| درگاه زرین‌پال، اقساط (aghsatpay) | zarinpal-woocommerce، جدول `aghsatpay_orders` | ماژول payments در CMS |
| پیش‌فاکتور | woocommerce-invoice-pro، قالب pre-invoice | تولید PDF در CMS |
| فید ترب | products-extractor-for-woocommerce، `torob-api/v1` | فید/API ترب از CMS |
| B2B (نقش shop، ورود و پنل همکاران) | صفحات Elementor + نقش کاربر | customer.type=partner + قیمت همکار |
| بازدید پست | post-views-counter | شمارنده در CMS (یا GA4) |
| سبد لید (CMS «لیدها») | mu-plugin banovit-lead-carts | سبد خرید سمت سرور، مستقیم در CMS |
| ویرایشگر محتوای AI | content-editor-ai (AvalAI) | ابزار ویرایش در admin |
| ویجت‌های اختصاصی Elementor، نقشه، seo widgets | Rico-elementor-widgets، Rico-map-widget، seo-elementor-widgets | کامپوننت‌های بلوکی در web |
| ویدئو روز دختر، تکسچر کمپین‌ها | girls-day-video | صفحه کمپین (landing) |
| بهینه‌سازی‌های امنیت و بار | mu-plugins bot-guard، WAF، cart-fragments gate، minicart fix | در معماری جدید لازم نیست (حذف علت) |

وضعیت‌های سفارشی سفارش: `proforma-invoice`، `ready-to-ship`، `pws-courier`، `pws-in-stock`، `pws-post`.

### کران‌ها (cron) مهم

`bnv_measurement_process_outbox` (دقیقه‌ای)، `torob_process_pending_product_page_webhooks` (۵ دقیقه)، `bnv_ads_sync` (ساعتی)، `bnv_ads_fx_fetch`، `bdi_sms_daily_reminders`، `wip_auto_change_status_event`.

## ۲. stage2 (109.122.247.77)

- سرور ۲ هسته، ۳.۸ گیگ رم، ۲۹ گیگ دیسک آزاد. nginx میزبان + docker. سرویس‌های دیگر روی همین سرور: Plane، okr، ai (نباید دست بخورند).
- `test2.banovit.com`: کلون وردپرس لایو (basic auth)، با DNS سیاه‌چاله برای سرویس‌های لایو
- `stage2.banovit.com`: CMS (کانتینر php8.3-fpm، DB `stage2_cms`)
- **ریسک از دست رفتن کار**: کد CMS روی stage2 روی شاخه محلی `stage2-1.2.0` است (۳ commit روی v1.2.0 که هرگز push نشده‌اند) به‌اضافه ۵۶ فایل تغییریافته/جدید commit‌نشده (design system، صفحات کیف پول/فروش، سبدهای تأمین‌کننده). GitHub master روی 1.4.2 است، پس stage2 از لایو عقب‌تر و هم‌زمان جلوتر است. پشتیبان این کارها در `D:\projects\stage2-snapshot\` گرفته شد (`s2-commits.patch`، `s2-uncommitted.diff`، `s2-untracked.tgz`). پیشنهاد: یک شاخه `feature/stage2-thread-work` روی develop ساخته و push شود (نیاز به تأیید Ali).
- قابلیت فقط-stage روی test2: افزونه **banovit-marketplace 0.4.0** (چندفروشندگی: فروشنده‌ها، چند پیشنهاد قیمت/موجودی برای هر محصول، کمیسیون بر اساس برند/دسته، API و webhook به CMS). این مدل در طراحی دیتابیس جدید به‌عنوان `offers` لحاظ شده است.
- test2 نسخه‌های قدیمی‌تر attribution (1.0.1)، measurement (0.3.4)، collection-festival (3.6.0) را دارد.

## ۳. banovit-cms (GitHub master = v1.4.2)

- Laravel 12، PHP 8.2+، Sanctum، فقط API (بدون Blade). دو SPA: admin-app (`/panel`) و supplier-app (`/supplier-app`)، React 19 + Vite
- ۸۷ مدل، ۱۵۵ migration، ۳۱۸ route در `routes/api.php`
- همگام‌سازی از WooCommerce فقط-خواندنی از طریق REST wc/v3 (هر ۱۵ دقیقه + webhook)؛ موجودی از Aug 2026 در خود CMS مدیریت می‌شود
- حوزه‌های قوی موجود: سفارش فروش، زیرسفارش و تخصیص به تأمین‌کننده، سبدهای ارسال، انبار، کیف پول مشتری/تأمین‌کننده، مالی، لیدها، Didar، سپیدار، Google Ads، attribution
- قراردادها: validation درون کنترلر، response()->json دستی، کش/صف/سشن روی driver دیتابیس، git-flow با release تگ‌دار
- نبود: کاتالوگ به‌عنوان منبع اصلی (الان کپی WC است)، محتوا (بلاگ/صفحه)، سئو، سبد/checkout مشتری، auth مشتری
