# چک‌لیست برابری قابلیت‌ها با وردپرس (Feature parity)

سند زنده. هر قابلیتی که در وردپرس فعلی (banovit.com) هست و باید در سیستم جدید (banovit-cms + apps/web) دوباره ساخته، منتقل یا عمداً حذف شود، اینجا یک ردیف دارد. یادآوری‌های Ali هم به همین فایل اضافه می‌شوند.

- منبع ممیزی: کد و دیتابیس test2 (کلون لایو روی stage2) + مقایسه md5 و HTML عمومی لایو. تاریخ اولین دور: ۲۰۲۶-۱۱-۰۸.
- قالب فعال لایو: `hello-elementor` (والد) با ~۴۵۰۰ خط سفارشی در `functions.php` + `header.php` + `footer.php`. قالب فرزند `banovit-child` (بازطراحی PDP) **غیرفعال** است.
- `functions.php`، `Rico-wc-addons` و قالب فرم 41787 روی test2 و لایو یکسان‌اند (md5). `festival-discount` لایو یک اصلاح کوچک بیشتر دارد (`banovit_order_has_discount_fee`).

## وضعیت‌ها

| وضعیت | معنی |
|---|---|
| ⬜ ساخت | باید در سیستم جدید ساخته شود |
| 🔁 انتقال داده | فقط داده باید منتقل شود (ساختار در CMS هست یا ساده است) |
| ❓ تصمیم | نیاز به تصمیم Ali |
| 🗑 حذف | در معماری جدید لازم نیست (علتش از بین می‌رود) |
| ✅ پوشش | thread مربوط آن را پوشش داده |

ستون «حوزه» یعنی thread یا بخشی که مسئول ساختن آن است: PLP، PDP، سبد/checkout، auth، تماس، منو/هدر، فروشندگان، بلاگ، CMS-admin، SEO، اندازه‌گیری.

---

## ۰. قواعد سراسری (برای همه threadها)

| # | قاعده | منبع |
|---|---|---|
| R1 | هر UI که فراتر از طرح‌های دریافتی است باید از سبک بصری همان طرح‌ها پیروی کند (شاخه `designs`، `designs/<section>/`) | Ali، ۲۰۲۶-۱۱-۰۸ |
| R2 | **تصاویر، لوگو و همه رسانه‌ها از فایل‌های سرور وردپرس** استفاده شوند (`wp-content/uploads`، همان فایل‌ها، نه بازسازی یا جایگزین) | Ali، ۲۰۲۶-۱۱-۰۸ |
| R3 | **داده‌های سئو تغییر نکنند**: title، meta description، canonical، داده‌های Yoast، alt تصاویر، URLها، H1، اسکیما، ریدایرکت‌ها. منبع فقط لایو (test2 قدیمی است). جزئیات در `03-seo-parity.md` | Ali، ۲۰۲۶-۱۱-۰۸ |
| R4 | تا cutover سایت جدید نباید ایندکس شود (۴ لایه: robots، X-Robots-Tag، basic auth، `SITE_INDEXABLE=false`) | `06-infra-stage2.md` |

---

## ۱. انواع محصول و منطق خرید ویژه

| # | قابلیت | کجای وردپرس | حوزه | وضعیت |
|---|---|---|---|---|
| P1 | **روشویی عمومی: فرم محاسبه قیمت** (بخش ۱۰) | قالب Elementor 41787 + ACF `kase_gheymat` / `omomi` | PDP + CMS | ⬜ ساخت، ❓ نرخ‌ها |
| P2 | **محصول «روشویی/سفارشی» بدون قیمت**: همیشه موجود، قابل خرید، به‌جای قیمت «مشاهده جزئیات»، به‌جای دکمه خرید باکس «سفارشی تولید می‌شود + مشاوره رایگان ۰۹۹۲۷۸۰۹۶۰۱» | متای `_sink_products=yes` در festival-discount (بخش «محصولات روشویی») | PLP + PDP | ⬜ ساخت |
| P3 | **خرید سفارشی (غیرآنلاین)**: محصولاتی از دسته/برند/لیست دستی که قیمت ندارند همان باکس سفارشی را می‌گیرند | Rico-wc-addons بخش ۲، option `cwa_custom_order_settings` (الان خالی، فقط phone) | PDP | ⬜ ساخت (یکی با P2) |
| P4 | **برندهای «در حال بروزرسانی قیمت»**: خرید آنلاین بسته، پیام «جهت اطلاع از قیمت تماس بگیرید» | Rico-wc-addons بخش ۱، option `cwa_disabled_brands_settings` (الان برند 2828) | PDP + سبد | ⬜ ساخت (پرچم روی برند در CMS) |
| P5 | **افزودنی‌های محصول (addons)**: گروه‌های قابل استفاده مجدد با نوع select / multiselect / button / color، اجباری یا اختیاری، قیمت هر گزینه `fixed` (به ازای هر عدد)، `percentage` (درصد قیمت پایه)، `flat_rate` (یک‌بار برای کل ردیف). ۶۸ محصول فعال، گروه‌ها: «افزودنی محصول آینه» (ضدبخار +۸۰,۰۰۰)، «لاروس» (مدل، رنگ روشنایی، افزودنی هوشمند، پکیج کامل) | Rico-wc-addons: CPT `cwa_addon_group`، متا `_cwa_group_addons`، روی محصول `_cwa_enable_addons` + `_cwa_product_addon_groups`؛ شورت‌کد `[cwa_product_options]` | PDP + سبد + CMS | ⬜ ساخت (بخش ۱۱) |
| P6 | **باکس قیمت و خرید اختصاصی** با قیمت قدیم/جدید، بج درصد تخفیف (`cwa-discount-badge`)، بج همکار، بج پلکانی | `[cwa_product_price_box]`، `[cwa_product_buy_box]`، `[cwa_banovit_badges]` | PLP + PDP | ✅/⬜ طبق طرح |
| P7 | **پیام اشکال‌زدایی روی لایو**: محصولات متغیر بدون قیمت (مثلاً روشویی عمومی 1047، 1056، 2074، کاملیا) متن «این محصول فعلا در دسترس نیست — علت فنی: …» را به مشتری نشان می‌دهند | `cwa_render_product_buy_box_shortcode` در Rico-wc-addons | PDP | ⬜ در سیستم جدید تکرار نشود؛ اصلاح لایو جدا (نیاز تأیید) |
| P8 | محصول متغیر و انتخاب ترکیب (موتور تشخیص ترکیب‌ها، ویژگی‌های غیرمتغیر نمایشی) | Rico-wc-addons | PDP | ⬜ ساخت |
| P9 | گارانتی محصول (چک‌باکس + عنوان + توضیح) | `functions.php`: `_enable_product_warranty`، `_product_warranty_title`، `_product_warranty_description` | PDP + CMS | 🔁 انتقال داده |
| P10 | فیلدهای ACF تک‌محصول: `product_details` (ویژگی‌های کلیدی)، `text_mojodi` (متن موجودی/زمان تولید)، `product_label` (لیبل خاص مثل «سفارشی»)، `feachers_one` (ویژگی‌های خاص) | ACF گروه `group_66b6f06d56dd2` | PDP + CMS | 🔁 انتقال داده |
| P11 | قیمت همکار (نقش `shop`): حراج نادیده گرفته می‌شود و قیمت = regular؛ تخفیف همکاری درصدی بر اساس برند (۲۶ برند، ۵ تا ۲۰٪؛ سنگسان باتیس فقط با قانون دسته) | festival-discount، option `banovit_brand_discounts` | قیمت‌گذاری CMS + سبد | ⬜ ساخت |
| P12 | تخفیف پلکانی بر اساس جمع سبد برای برندهای کالکشن | festival-discount (`banovit_get_tiered_settings`) — **الان کد آن را خاموش کرده است** | CMS | ❓ ساخته شود یا نه |
| P13 | جدول قیمت پلکانی `[banovit_pricing_table]` و دکمه فیلتر `[banovit_tiered_filter_toggle]` | festival-discount | PLP/landing | ❓ (وابسته به P12) |
| P14 | مخفی‌کردن محصولات ناموجود و بدون قیمت بیرون از shop/دسته/برچسب | `hide_oos_and_zero_price_except_shop` | PLP/جستجو | ⬜ قاعده در API |
| P15 | مرتب‌سازی ناموجودها به آخر لیست | Rico-wc-addons `cwa_manage_unavailable_products_visibility` | PLP | ✅ PLP (بررسی) |

## ۲. سبد خرید، checkout، سفارش

| # | قابلیت | کجای وردپرس | حوزه | وضعیت |
|---|---|---|---|---|
| C1 | **خدمات نصب**: انتخاب نصب برای هر قلم (`bdi_install_selected`)، هزینه نصب شرطی به‌صورت fee جدا، قوانین با شرط دسته/برچسب/برند/روش ارسال/تعداد/نوع مشتری/جمع سبد، پلکان قیمت بر تعداد، تخفیف نصب (۲ تا ۵ عدد ۱۰٪، ۶+ عدد ۲۰٪، قابل جمع)، غیرفعال‌سازی نصب روی محصول (`_bdi_install_disabled`) | banovit-delivery-installation 1.6.2، options `bdi_cost_rules`، `bdi_discount_rules` | PDP + سبد + CMS | ⬜ ساخت (بخش ۱۲) |
| C2 | **زمان پردازش سفارش** شرطی (مثلاً روشویی عمومی ۱۰ روز، برندهای تولیدی ۳ تا ۵ روز) = بیشترین مقدار بین اقلام | `bdi_processing_rules` | PDP + checkout | ⬜ ساخت |
| C3 | **انتخاب تاریخ و بازه ساعتی دریافت و نصب** در checkout، الگوی هفتگی، فاصله روزها، تعطیلات شمسی | `bdi_schedule_settings`، متای سفارش `_bdi_delivery_date/slot`، `_bdi_install_date/slot` | checkout + CMS | ⬜ ساخت |
| C4 | پیامک یادآوری ارسال/نصب (روز قبل و همان روز) و تأیید سفارش | BDI SMS، cron `bdi_sms_daily_reminders` | CMS اعلان‌ها | ⬜ ساخت |
| C5 | تخمین زمان ارسال روی PDP | `[bdi_delivery_estimate]` + ویجت Elementor | PDP | ⬜ ساخت |
| C6 | **بسته‌بندی ویژه** (چک‌باکس قبل از پرداخت): هزینه = وزن سبد × ۷,۵۰۰، گرد به بالا به مضرب ۵۰,۰۰۰ تومان | `functions.php` `custom_packaging_option` / `add_packaging_fee` | checkout | ⬜ ساخت |
| C7 | فیلدهای checkout: نام*، نام خانوادگی*، شرکت، کشور*، استان*، شهر*، خیابان*، واحد، کدپستی، موبایل*، ایمیل؛ آدرس ارسال جدا ندارد (`woocommerce_cart_needs_shipping_address=false`) | woo-checkout-field-editor-pro | checkout | ⬜ ساخت |
| C8 | حمل‌ونقل ایران (استان/شهر `state_city` ۱۴۲۵ ترم، پیک/پست/تیپاکس) و وضعیت‌های pws | persian-woocommerce-shipping (+pro) | checkout + CMS | ⬜ ساخت |
| C9 | ارسال رایگان بالای ۱۰ میلیون تومان (متن PDP) | تنظیم حمل | checkout | ❓ قاعده دقیق را تأیید کن |
| C10 | درگاه‌های فعال لایو: «درگاه پرداخت آنلاین» (زرین‌پال `WC_ZPal`)، «کارت به کارت» (bacs)، «ثبت فاکتور» (`invoice_registration`)؛ سابقه اقساط (جدول `aghsatpay_orders`). روش ارسال فعال لایو: ۹ نمونه `WC_Flat_Method` (PWS) | zarinpal، bacs، invoice-pro | پرداخت CMS | ⬜ ساخت |
| C11 | وضعیت‌های سفارش سفارشی: پیش فاکتور، تکمیل و آماده ارسال، ارسال شده به انبار، بسته‌بندی شده، تحویل پیک/پست/تیپاکس | `functions.php` + PWS | CMS | ✅ CMS مدل دارد؛ نگاشت لازم |
| C12 | پیش‌فاکتور سبد خرید (صفحه 5265، قالب `pre-invoice.php`) و فاکتور PDF | woocommerce-invoice-pro | CMS PDF | ⬜ ساخت |
| C13 | پیگیری سفارش `[custom_order_tracking]` (صفحه track-order) | `functions.php` | حساب کاربری | ⬜ ساخت |
| C14 | رفع باگ order key خالی | `fix_missing_order_key_*` | — | 🗑 حذف |
| C15 | ذخیره افزودنی‌ها روی قلم سفارش به‌صورت متا (عنوان → گزینه‌ها با قیمت) | Rico-wc-addons بخش ۴ | سفارش CMS | ⬜ ساخت (با P5) |
| C16 | تخفیف همکاری/پلکانی به‌صورت fee منفی «تخفیف همکاری» / «تخفیف پلکانی» در سفارش | festival-discount | CMS | ⬜ ساخت (با P11) |
| C17 | سبد ماندگار کاربر واردشده → فید لید CMS | mu-plugin `banovit-lead-carts` (فقط لایو) | CMS | 🔁 سبد سمت سرور در CMS |
| C18 | کوپن و ردیابی کوپن | mu-plugin `banovit-coupon-tracking` | سبد + اندازه‌گیری | ⬜ ساخت |
| C19 | دکمه‌های +/− تعداد | `functions.php` | سبد/PDP | ✅ طبق طرح |

## ۳. کاربر، ورود، B2B

| # | قابلیت | کجای وردپرس | حوزه | وضعیت |
|---|---|---|---|---|
| A1 | ورود/ثبت‌نام OTP پیامکی ۴ رقمی، تایمر ارسال مجدد ۱۲۰ ثانیه، محدودیت‌ها | collection-festival 3.6.1، جدول `banowit_festival_otp`، صفحه login | auth | ✅ feature/web-auth (بررسی) |
| A2 | درخواست پنل همکاران (نام، نام مجموعه، موبایل، آدرس + OTP)، صف بررسی در ادمین، پیامک مشخصات بعد از تأیید | collection-festival، جدول `banowit_festival_reqs`، شورت‌کد `[banowit_festival]` (۵ جا) | auth + CMS | ⬜ ساخت |
| A3 | نقش‌ها: `shop` (همکار)، `customer`، `subscriber`، نقش‌های ERP/مالی، `shower` | user-role-editor | CMS | 🔁 customer.type |
| A4 | منوی کاربر `[custom_user_box]` | `functions.php` | منو/هدر | ✅ طرح |
| A5 | صفحات ورود همکاران (login-b2b)، پنل همکاران (b2b)، landing/b2b | Elementor | auth/landing | ⬜ ساخت |
| A6 | آدرس ورود ادمین مخفی | wps-hide-login | — | 🗑 حذف |

## ۴. فهرست محصولات، جستجو، منو

| # | قابلیت | کجای وردپرس | حوزه | وضعیت |
|---|---|---|---|---|
| L1 | فیلتر پیشرفته (قواعد per-category/brand/tag، ترتیب درگ، قیمت، فیلترهای فعال، موبایل، شمارش نتایج، مرتب‌سازی) | banovit-advanced-woocommerce-filters 1.5.4، option `cwa_category_filter_rules`، `cwa_selected_filter_attributes` | PLP | ✅ PLP |
| L2 | «محصولات تخفیف‌دار» = فیلتر `on_sale=1` (منبع: قیمت حراج ووکامرس؛ ۷۵۳ ردیف `_sale_price`، هیچ‌کدام تاریخ پایان ندارد) | فیلتر + منوی دسته | PLP | ✅ PLP |
| L3 | URL تخت دسته `/shop/category/{slug}/` + ریدایرکت به canonical | `bv_flat_product_cat_permalink`، `bv_redirect_product_cat_to_canonical` | SEO + PLP | ✅ PLP |
| L4 | noindex,follow صفحات ۲ به بعد دسته/برند؛ noindex فیلترها با canonical تمیز؛ گارد ربات فیلتر | `functions.php` wp_robots، mu `banovit-filter-seo`، `bnv-bot-guard-plus` | SEO | ⬜ ساخت (قاعده در web) |
| L5 | درخت منوی دسته کناری قابل درگ در ادمین (ترتیب و دیده‌شدن جدا از درخت ووکامرس) | `functions.php`، options `cwa_sidebar_tree_structure`، `cwa_sidebar_visible_cats`؛ `[category_menu_button]` | منو | 🔁 انتقال ترتیب |
| L6 | آیکون SVG دسته‌های اصلی | term meta `category-icon-url` (۱۰ دسته اصلی) | منو/PLP | 🔁 انتقال |
| L7 | منوی موبایل `[mobile_menu]` + اصلاح کشو (قفل اسکرول، دکمه بستن) | `functions.php`، mu `bnv-mobile-menu-fix` | منو | ✅ feature/web-menu |
| L8 | نوار پایین موبایل با تب فعال سمت سرور | `hello-elementor/footer.php` | منو | ✅/⬜ طبق طرح |
| L9 | توضیح دسته جمع‌شونده `[archive_description_toggle]`، FAQ دسته (`_faqs`)، توضیح تکمیلی، دسته‌ها/برندهای مرتبط | `functions.php`، exra-post-rico (`_faqs`، `_related_cats`، `_related_brands`، `_related_tags`، `_supp_desc`)، ACF `shop_details`، term meta `category_extra_description_*` | PLP + SEO | 🔁 انتقال |
| L10 | جستجو: اولویت عنوان، کوئری‌های Elementor `search_products` / `search_articles`، حذف پارامتر `e_search_props` با 301 | mu `banovit-search-relevance`، `functions.php` | جستجو | ⬜ ساخت |
| L11 | کاروسل‌های محصول (custom_loop_carousel، ۱۲۰۵ استفاده؛ lfa_loop_carousel) و بنرها | Rico-elementor-widgets | خانه/PLP | ⬜ کامپوننت |
| L12 | بنرهای اسلایدی بالای PLP (بسته‌بندی، «نصبش جوووره») | Elementor | PLP | ✅/⬜ طبق طرح، فایل‌ها از WP (R2) |
| L13 | صفحه برند `/brand/{slug}/`: لوگو، تحلیل برند، سال، ستاره، محل، دسته‌ها، FAQ، مقالات، پرفروش‌ها، کاتالوگ و لیست قیمت | term meta pa_brand (`brand_logo`، `brand-analiz`، `year`، `star`، `location`، `faq_brands`، `seoew_catalog_id`، `seoew_price_list_id`، …) | صفحه برند | 🔁 انتقال + ⬜ ساخت |

## ۵. صفحه محصول (PDP)

| # | قابلیت | کجای وردپرس | حوزه | وضعیت |
|---|---|---|---|---|
| D1 | قالب تک‌محصول Elementor 39620 | Elementor Pro | PDP | ⬜ طبق طرح |
| D2 | گالری با لایت‌باکس `[cwa_product_gallery]`، تصویر شاخص `[product_featured_image]` | `functions.php` | PDP | ⬜ ساخت |
| D3 | جدول ویژگی‌ها `[product_attributes_list]`، معرفی محصول `[product_intro_sections]`، برند و SKU `[show_brand_sku]`، بج برند، دسته/برچسب | `functions.php` | PDP | ⬜ ساخت |
| D4 | متن لایسنس تصویر («تصاویر این محصول به درخواست صاحب برند دارای لایسنس…») + اسکیما ImageLicense | Elementor + Schema Pro 2442 | PDP + SEO | ⬜ ساخت |
| D5 | باکس «مشاوره رایگان» با کد پیگیری لید | Elementor + banovit-attribution `bnv-leadcode.js` | PDP + اندازه‌گیری | ⬜ ساخت |
| D6 | نظرات محصول و ارسال نظر مهمان با AJAX، اسلایدر نظرات اخیر | Rico-comment `[custom_product_reviews]`، `[custom_recent_reviews]` | PDP + CMS | ⬜ ساخت |
| D7 | پیشنهادهای فروشندگان (چندفروشندگی) | banovit-marketplace (فقط test2) `[bmp_offers]` | فروشندگان | ✅ feature/web-sellers |
| D8 | اسکیما Product/Offer با قیمت ریالی IRR، Review، FAQ، LocalBusiness | Schema Pro + mu `banovit-product-schema-fix` | SEO | ⬜ ساخت (R3) |

## ۶. محتوا، بلاگ، صفحات

| # | قابلیت | کجای وردپرس | حوزه | وضعیت |
|---|---|---|---|---|
| B1 | ۲۳۷ پست Elementor، قالب تک‌پست 2369، آرشیو 2368 | Elementor | بلاگ | ⬜ رندر محتوا |
| B2 | شورت‌کدهای بلاگ: `[simple_toc]` (۹۸)، `[last_update]` (۷۰)، `[post-views]` (۷۰)، `[reading_time]`، `[article_meta_box]`، `[article_tags_box]`، `[recent_posts_list]`، `[post_categories_list]`، `[custom_breadcrumb]` | `functions.php`، post-views-counter | بلاگ | ⬜ ساخت |
| B3 | ویجت/شورت‌کدهای سئو: `[banovit_products]`، `[banovit_related_products]` (۳۵)، `[banovit_article]` (۱۳)، `[banovit_tip]`، `[banovit_map]` (گوگل‌مپ embed)، `[banovit_brand_intro]`، کاتالوگ/لیست قیمت برند، `[banovit_quiz]` / `[banovit_q]` آزمون چهارگزینه‌ای؛ ویجت‌های seoew-* (suggested-article ۳۱۱، related-products ۳۰۲، tip-box ۳۰۰، quiz ۸۲، product-slider ۱۶) | seo-elementor-widgets 1.1.5 (راهنما: `SHORTCODES.md`) | بلاگ | ⬜ ساخت |
| B4 | نقشه Leaflet/OSM با چند نشانگر در پست‌های آدرس بورس‌ها (پست‌های 4599، 15780، 19358) | Rico-map-widget `banovit_map` | بلاگ | ⬜ ساخت |
| B5 | امتیاز ستاره‌ای پست‌ها (YASR، ۱۰۴ پست) | yet-another-stars-rating + mu optimize | بلاگ + SEO | ⬜ ساخت |
| B6 | الحاقات پست (مقالات مرتبط `_related_posts`، توضیحات تکمیلی، FAQ) `[site_addons_render]` | exra-post-rico 2.4.1 | بلاگ | 🔁 انتقال |
| B7 | ویجت‌های Woodmart (`wd_*`، بیش از ۲۰۰۰ استفاده) و `cms_block` / `woodmart_layout` در محتوای قدیمی؛ قالب Woodmart فعال نیست | باقیمانده Woodmart | بلاگ | ❓ بررسی: رندر می‌شوند یا خالی‌اند |
| B8 | صفحات ثابت: درباره ما، تماس، روش‌های پرداخت، رویه ارسال، حریم خصوصی، image-licence، کمپین‌ها | Elementor | صفحات | ⬜ ساخت (محتوا عیناً) |
| B9 | صفحه تماس: تلفن ۰۹۹۲۷۸۰۹۶۰۱ و ۰۲۱-۹۱۰۱۴۰۹۳، «ساعت پاسخگویی: ۸ صبح الی ۶ عصر»، فرم تماس (نام، ایمیل، عنوان، متن)، فرم درخواست تماس (تلفن)؛ **روی صفحه نقشه و آدرس نیست** | صفحه 279 + form-builder | تماس | ✅ feature/web-contact |
| B10 | ویرایشگر محتوای AI در ادمین | content-editor-ai (AvalAI) | CMS-admin | ❓ |

## ۷. فرم‌ها و لید

| # | قابلیت | کجای وردپرس | حوزه | وضعیت |
|---|---|---|---|---|
| F1 | فرم‌ساز اختصاصی با اعتبارسنجی موبایل/ایمیل و پیامک: «مشاوره رایگان» (id 1)، «تماس با ما» (id 2) | form-builder 1.2.0، جدول‌های `cf_forms`، `cf_submissions`، `[form_builder]` | فرم‌ها CMS → SalesLead | ⬜ ساخت |
| F2 | فرم‌های Elementor: «Schedule Appointment» (۲۵۷ ارسال، آخری ۲۰۲۶-۰۶)، فرم صفحه 25855 (۲۶)، «درخواست همکاری در برگه برند» (۱) | Elementor Pro forms، جدول `e_submissions` | فرم‌ها | 🔁 انتقال سابقه + ⬜ ساخت |
| F3 | هویت وب و ارسال فرم مشاوره به CMS | banovit-attribution / measurement → `/api/webhooks/web-identity` | اندازه‌گیری | ⬜ ساخت |

## ۸. اندازه‌گیری، یکپارچه‌سازی‌ها

| # | قابلیت | کجای وردپرس | حوزه | وضعیت |
|---|---|---|---|---|
| M1 | GTM + Matomo در head، ecommerce view، رویدادهای سبد سمت سرور، رویداد کاروسل/بنر، جستجو، کوپن | `header.php`، banovit-measurement 0.4.1، mu: `banovit-cart-events-fix`، `banovit-carousels-banners`، `banovit-search-tracking`، `banovit-matomo-ecommerce-view`، `banovit-coupon-tracking` | اندازه‌گیری | ⬜ dataLayer در web |
| M2 | attribution سفارش (utm، gclid، کد لید) | banovit-attribution 1.1.2 | سفارش CMS | ⬜ ساخت |
| M3 | Google Ads sync و outbox | cron `bnv_ads_sync`، `bnv_measurement_process_outbox` | CMS | ⬜ ساخت |
| M4 | فید و API ترب (`torob-api/v1/orders`، `order-status`) | products-extractor-for-woocommerce | CMS | ⬜ ساخت |
| M5 | پیامک سفارش | wp-sms 7.1، persian-woocommerce-sms | CMS اعلان‌ها | ✅ NotificationTemplate |
| M6 | دستیار هوش مصنوعی خرید (آزمایشی، فقط حساب مشخص) | banovit-ai-assistant 0.1.7 | ❓ | ❓ |
| M7 | ارسال ایمیل SMTP | wp-mail-smtp | CMS | 🔁 تنظیم |

## ۹. کارایی، امنیت، نگهداری (معمولاً حذف)

| # | قابلیت | کجای وردپرس | وضعیت |
|---|---|---|---|
| X1 | کش: WP Super Cache، Redis، کش کاروسل، Arvan | افزونه‌ها + mu `zz-carousel-cache` | 🗑 (کش Next.js/CDN) |
| X2 | LCP، dequeue دارایی‌ها، lazy-load، فونت محلی | mu `zz-banovit-lcp`، `zz-banovit-assets`، `functions.php` | 🗑 (ولی هدف LCP حفظ شود) |
| X3 | گارد ربات، cart-fragments gate، minicart fix، trim ajax | mu `bnv-bot-guard-plus`، `bnv-cart-fragments-gate`، `bnv-minicart-fix`، `zz-trim-ajax` | 🗑 (علت حذف می‌شود؛ گارد ربات فیلتر را در web/CDN حفظ کن) |
| X4 | عبور از WAF برای ویرایشگرها و checkout | mu `banovit-waf-pass`، `bnv-waf-checkout-fix` (فقط لایو) | 🗑 |
| X5 | قفل به‌روزرسانی قالب، جلوگیری از migration المنتور، YASR selfcheck | mu `bnv-block-theme-updates`، `zz-block-elementor-migrations`، `zz-fix-yasr-selfcheck` | 🗑 |
| X6 | خروجی CSV محصولات با فیلتر برند | `functions.php` | ⬜ اکسپورت در CMS-admin |
| X7 | ویدئو روز دختر برای ادمین‌ها | girls-day-video | 🗑 |
| X8 | فایل‌های قدیمی Woodmart (`woodmart_*`، `cms_block`) | دیتابیس | ❓ (B7) |

---

## ۱۰. روشویی عمومی: فرم محاسبه قیمت (یادآوری ۱ Ali)

### محصولات

دسته `public-vanity` (term 3535، «روشویی عمومی»)، ۶ محصول، همه برند سنگسان باتیس، جنس کوآرتز. **هیچ‌کدام قیمت ووکامرس ندارند** (نه ساده، نه تنوع‌ها).

| ID | نام | نوع | `product_label` | `_sink_products` | `kase_gheymat` (تومان) | فرم |
|---|---|---|---|---|---|---|
| 3863 | سفارشی مدل کالیکس | simple | سفارشی | yes | 5,350,000 | دارد |
| 4350 | سفارشی مدل گلد | simple | سفارشی | yes | 9,000,000 | دارد |
| 4976 | استاندارد و سفارشی مدل 1056 | variable | استاندارد و سفارشی | no | 7,500,000 | دارد |
| 5249 | سفارشی مدل 1047 | variable | استاندارد و سفارشی | no | 10,250,000 | دارد |
| 3274 | استاندارد و سفارشی مدل 2074 | variable | استاندارد و سفارشی | no | 10,750,000 | دارد |
| 3872 | استاندارد مدل کاملیا | variable | استاندارد | — | — | ندارد |

- محصولات **simple** (کالیکس، گلد): ویژگی‌های نمایشی «طول صفحه: حداقل ۱۰۰ سانتی‌متر (متغیر)»، «عرض صفحه: ۵۵ سانتی‌متر (ثابت)»، رنگ صفحه (سفید/کرم/طوسی)، ابعاد و رنگ لگن. چون `_sink_products=yes` است، خرید آنلاین ندارند و باکس «سفارشی تولید می‌شود + مشاوره رایگان» نشان داده می‌شود (P2).
- محصولات **variable** (1056، 1047، 2074، کاملیا): دو ویژگی متغیر «تعداد لگن» (یک/دو/سه عدد) × «زیرسازی و پیشانی» (میخواهم/نمیخواهم) (کاملیا: «مدل» = با کلاف و زیر سازی / بدون زیر سازی) = ۶ تنوع، همه بدون قیمت. طول صفحه برای هر تعداد لگن ثابت است (مثلاً 1047: ۷۰/۱۴۰/۲۰۰ سانتی‌متر)، به‌اضافه فاصله آکس به آکس و ارتفاع پیشانی ۳۰ سانتی‌متر. چون `_sink_products=no` است، روی لایو پیام خطای P7 می‌بینند.
- `text_mojodi`: «این محصول به صورت سفارشی تولید میشود! (زمان تولید: ۵ - ۱۰ روز کاری)…»؛ برای 1047: «…برای اطلاع از قیمت از فرم محاسبه قیمت در این صفحه استفاده نمایید.»
- زمان پردازش سفارش این دسته در BDI: ۱۰ روز (`bdi_processing_rules`، قانون «روشویی عمومی»).

### محل داده

- گروه ACF «تک محصول روشویی عمومی» (`group_66c19e7a1370a`، فقط وقتی محصول در `product_cat:public-vanity` است):
  - `kase_gheymat` (text، «قیمت هر کاسه»): رشته با جداکننده هزار، مثل `5,350,000`، به تومان
  - `omomi` (text، «فرم خاص (مثل محاسبه قیمت روشویی عمومی)»): مقدار `[elementor-template id="41787"]`
- قالب تک‌محصول 39620 یک ویجت shortcode دارد که مقدارش تگ پویای ACF روی `omomi` است، پس فرم فقط روی محصولاتی ظاهر می‌شود که `omomi` پر دارند.
- قالب 41787 «فرم محاسبه قیمت کاسه روشویی» (elementor_library، form_id `public_vanity`). روی لایو و test2 یکسان است (md5).

### فیلدهای فرم

| custom_id | نوع | برچسب | جزئیات |
|---|---|---|---|
| `width` | number، اجباری | طول صفحه (سانتی متر) | placeholder «حداقل 100 سانت»، `min=100` (فقط ویژگی HTML) |
| — | html | قیمت صفحه | متن ثابت: «هر متر صفحه 35,000,000 تومان در عرض 55 سانتی متر» |
| `kase` | number، اجباری | تعداد کاسه | placeholder «حداقل 2 عدد»، `min=2` |
| — | html | قیمت کاسه | تگ ACF: «قیمت هر کاسه {kase_gheymat} تومان» |
| `gheymat_kase` | hidden | قیمت کاسه | مقدار = `kase_gheymat` محصول |
| `needed` | checkbox | (بدون برچسب) | یک گزینه: «پایه و کلاف فلزی و پیشانی (متری 10,000,000 تومان)» |

دکمه «ارسال» (`#show_response`) و یک `<div id="response_form">` برای نتیجه.

### فرمول (اسکریپت داخل قالب، فقط سمت مرورگر)

```
W = طول صفحه به سانتی‌متر (ورودی)
N = تعداد کاسه (ورودی)
K = kase_gheymat محصول (بعد از حذف ویرگول)

اگر «پایه و کلاف فلزی و پیشانی» تیک خورده باشد:
    قیمت = W × 350,000 + N × K        (یعنی متری 35,000,000)
وگرنه:
    قیمت = W × 250,000 + N × K        (یعنی متری 25,000,000)

نمایش: «قیمت تقریبی: {قیمت با جداکننده هزار} تومان»
```

مثال کالیکس، ۲۰۰ سانتی‌متر، ۲ کاسه، با کلاف: `200×350,000 + 2×5,350,000 = 80,700,000` تومان.

### رفتار و ایرادهای فعلی (در بازسازی درست شود)

1. **تناقض نرخ**: متن فرم می‌گوید صفحه متری ۳۵ میلیون و کلاف متری ۱۰ میلیون (جمعاً ۴۵)، ولی کد بدون کلاف ۲۵ و با کلاف ۳۵ حساب می‌کند. یعنی کد «صفحه = ۲۵، کلاف = ۱۰» را فرض کرده است. **❓ Ali باید نرخ درست را تأیید کند.**
2. نرخ‌های صفحه و کلاف در کد و متن قالب ثابت‌اند (برای همه محصولات یکی، جدا از عرض صفحه). فقط قیمت کاسه per-product است.
3. اعتبارسنجی نیست: کلیک روی دکمه با `preventDefault` فرم را ارسال نمی‌کند، پس `min` رعایت نمی‌شود و ورودی خالی `NaN` می‌دهد.
4. فرم عملاً هیچ لیدی ثبت نمی‌کند (کل تاریخچه ۱ ارسال در `e_submissions`، ۲۰۲۶-۰۸-۱۱). اکشن ایمیل به alimhmd2776@gmail.com تنظیم شده ولی اجرا نمی‌شود.
5. نتیجه به سبد خرید راه ندارد؛ مسیر خرید فقط تماس تلفنی است.
6. محصولات variable با `_sink_products=no` به‌جای باکس سفارشی، پیام «علت فنی» می‌گیرند (P7).

### پیشنهاد بازسازی

- در CMS، «قالب قیمت‌گذاری ابعادی» برای دسته (یا per-product override): `slab_price_per_cm`، `frame_price_per_cm` (کلاف و پیشانی، اختیاری)، `min_length_cm=100`، `min_bowls=2`، `bowl_price` per-product (از `kase_gheymat`)، عرض ثابت ۵۵ سانتی‌متر برای نمایش.
- API محاسبه سمت سرور (همان فرمول) + محاسبه زنده در PDP با اعتبارسنجی، و دکمه «ثبت درخواست / مشاوره» که لید (SalesLead) با ابعاد، تعداد کاسه، گزینه کلاف و قیمت تقریبی بسازد. اگر Ali بخواهد، افزودن به سبد با قیمت محاسبه‌شده سمت سرور.
- UI طبق R1 (سبک طرح‌های PDP).

---

## ۱۱. ساختار داده افزودنی‌ها (Rico addons) برای PDP

```
cwa_addon_group (CPT)  meta _cwa_group_addons = [
  { title, type: select|multiselect|button|color, required: 0|1,
    options: [ { label, color_code, price_type: fixed|percentage|flat_rate,
                 price, has_desc: '0'|'1', desc } ] }
]
product meta: _cwa_enable_addons = yes|no, _cwa_product_addon_groups = [group_id, ...]
(متای قدیمی‌تر: _cwa_group_type، _cwa_group_options روی گروه)
```

- ورودی فرم: `cwa_addons[<index افزودنی>] = <index گزینه>` یا آرایه برای multiselect.
- اعتبارسنجی هنگام افزودن به سبد: افزودنی اجباری خالی → «لطفاً افزودنی اجباری «…» را انتخاب نمایید.»
- قیمت قلم = قیمت پایه + جمع (`fixed`) + جمع (قیمت پایه × درصد/۱۰۰ برای `percentage`) + جمع(`flat_rate`)/تعداد.
- در سبد و سفارش هر افزودنی یک ردیف متا «عنوان: گزینه (+قیمت تومان)» است.
- **خدمات نصب جزو این سیستم نیست**؛ نصب در افزونه BDI است (بخش ۱۲).

## ۱۲. خدمات نصب (BDI) برای PLP/PDP/سبد

- «امکان افزودن خدمات نصب» = محصولی که حداقل یک قانون فعال در `bdi_cost_rules` با آن match شود و `_bdi_install_disabled ≠ yes` باشد (الان هیچ محصولی دستی غیرفعال نشده). بدون قانون هزینه، گزینه نصب نمایش داده نمی‌شود.
- ساختار هر قانون: `{id, label, enabled, match_mode: all|any, conditions: [{type, values|min|max}], action}`؛ شرط‌ها: `product_cat`، `product_tag`، `product_brand` (نام برند)، `shipping_method`، `qty_range`، `customer_type` (نقش یا guest)، `cart_subtotal_range`. اولین قانون match‌شده اعمال می‌شود (تخفیف‌های stackable جمع می‌شوند). شرط‌های سبدی روی PDP نادیده گرفته می‌شوند.
- action هزینه: `{pricing_mode: flat|tiered, flat_price, tiers: [{min, max, price}]}`. نمونه‌های فعلی: نصب رایگان برای آلکا/درسا/شودر/کالکشن/کی دبلیو سی در دسته‌های اصلی؛ شیرآلات ۱,۲۰۰,۰۰۰، روشویی ۲,۰۰۰,۰۰۰، سینک ۲,۵۰۰,۰۰۰، توالت ۳,۰۰۰,۰۰۰ تومان (به ازای هر عدد).
- هزینه نصب در سبد fee جدا است (نه افزوده به قیمت محصول).

## ۱۳. پاسخ به سؤال‌های داده threadها (۲۰۲۶-۱۱-۰۸)

| سؤال | پاسخ از وردپرس |
|---|---|
| منبع «تخفیف شگفت‌انگیز» (PLP) | **در وردپرس لایو چنین مفهومی نیست** (نه در قالب‌ها، نه در کد، نه در HTML لایو PLP). تنها منبع تخفیف، قیمت حراج ووکامرس است (`_sale_price`، ۷۵۳ ردیف، بدون تاریخ پایان) که بج درصد و فیلتر «محصولات تخفیف‌دار» (`on_sale=1`) را می‌سازد. باقیمانده Woodmart `include_amazingwrap_option` فقط روی ۱ محصول yes است. اگر طرح آن را دارد، ❓ Ali باید تعریفش کند (مثلاً حراج با تاریخ پایان + شمارش معکوس، یا تگ/لیست دستی در CMS). |
| «امکان افزودن خدمات نصب» (PLP) | بخش ۱۲: قانون match‌شده در `bdi_cost_rules` و `_bdi_install_disabled ≠ yes`. |
| تصاویر دایره‌ای زیردسته‌ها (PLP) | **وردپرس برای زیردسته‌ها تصویر ندارد.** `thumbnail_id` فقط برای ۱ دسته پر است؛ متای `category_icon` و `title_image` (۴۹ دسته) خالی‌اند. فقط ۱۰ دسته اصلی آیکون SVG دارند (`category-icon-url`، مثلاً روشویی: `uploads/2026/07/hands-bubbles_9844422-1.svg`). PLP لایو زیردسته‌ها را فقط متنی نشان می‌دهد. طبق R2 تصویر باید از فایل‌های WP باشد، پس گزینه‌ها: آیکون والد، تصویر شاخص یک محصول از آن دسته، یا آپلود تصویر جدید در CMS. ❓ Ali |
| لوگوی برندها (PLP/برند) | term meta `brand_logo` روی `pa_brand` = ID پیوست (۱۹ از ۳۵ برند)؛ متای `image` همان را به‌صورت `{url, id}` دارد. مثال: آلکا → `uploads/2025/05/alka-logo.png`، سنگسان → `uploads/2024/08/SANGSAN.png`. ۱۶ برند لوگو ندارند. |
| متای Yoast صفحه `/contact-us/` (تماس) | Yoast عنوان/توضیح سفارشی ندارد (پیش‌فرض‌ها). خروجی لایو: title «تماس با ما در بانویت»، description «صفحه تماس با ما در بانویت»، canonical `https://banovit.com/contact-us/`، og:type article، og:image `uploads/2022/05/rubika-icon.png` (32×32). |
| مختصات نقشه / لینک نشان و ساعت کاری (تماس) | صفحه تماس لایو **نقشه، آدرس و لینک نشان ندارد**. ساعت: «ساعت پاسخگویی: 8 صبح الی 6 عصر»؛ تلفن‌ها 09927809601 و 021-91014093. تنها مختصات «پیش‌فرض» در کد ویجت نقشه است: 35.7454740273471, 51.46452698083354 (zoom 15) که در پست «بورس شیرآلات تهران» هم آمده، ولی آدرس رسمی بانویت نیست. LocalBusiness در Schema Pro: «ایران، تهران»، تهران، کدپستی 75801. ❓ Ali آدرس و مختصات واقعی را بدهد. |
| ساختار افزودنی نصب Rico (PDP) | بخش ۱۱ (افزودنی‌ها) و بخش ۱۲ (نصب در BDI، نه Rico). |

---

## ۱۴. فهرست کامل منبع (برای مرور)

**mu-plugins لایو (۲۳):** banovit-carousels-banners، banovit-cart-events-fix، banovit-coupon-tracking، banovit-filter-seo، banovit-lead-carts*، banovit-matomo-ecommerce-view، banovit-product-schema-fix، banovit-search-relevance، banovit-search-tracking، banovit-waf-pass*، banovit-yasr-optimize، bnv-block-theme-updates*، bnv-bot-guard-plus، bnv-cart-fragments-gate، bnv-minicart-fix، bnv-mobile-menu-fix، bnv-waf-checkout-fix*، zz-banovit-assets، zz-banovit-lcp، zz-block-elementor-migrations، zz-carousel-cache، zz-fix-yasr-selfcheck، zz-trim-ajax. (* = روی test2 نیست؛ test2 به‌جایش `bnv-test2-sms-stub` دارد.)

**افزونه‌های اختصاصی:** Rico-wc-addons 4.5.0، Rico-comment 1.9.4، Rico-elementor-widgets 2.5.2، Rico-map-widget 1.0.0، festival-discount 6.2، collection-festival 3.6.1، banovit-delivery-installation 1.6.2، banovit-advanced-woocommerce-filters 1.5.4، banovit-attribution 1.1.2، banovit-measurement 0.4.1، banovit-ai-assistant 0.1.7، form-builder 1.2.0، exra-post-rico 2.4.1، seo-elementor-widgets 1.1.5، content-editor-ai 0.1.0، girls-day-video 1.0.1، products-extractor-for-woocommerce 2.3.1 (ترب)، banovit-marketplace 0.4.0 (فقط test2).

**افزونه‌های عمومی:** WooCommerce 10.8.1، Elementor 4.0 + Pro 3.26، ACF 6.7، Yoast 27 + Premium، Schema Pro، YASR، persian-woocommerce، persian-elementor، PWS + pro، zarinpal، woocommerce-invoice-pro، woo-checkout-field-editor-pro، wp-sms، persian-woocommerce-sms، post-views-counter، redis-cache، wp-super-cache، wp-mail-smtp، wps-hide-login، user-role-editor، classic-editor، classic-widgets، MOMediaAPI، RTL-CareUnit-disable.

**قالب‌های Elementor فعال:** هدر 39890، فوتر 39809، تک‌محصول 39620، آرشیو محصول 39936، نتایج جستجو 52302، تک‌پست 2369، آرشیو بلاگ 2368، آیتم‌های حلقه 31393/36982/38904/39938/40184، فرم روشویی عمومی 41787، «خلاصه مطلب» 60937. به‌اضافه ۷۷ `cms_block` و ۳۵ `woodmart_layout` قدیمی (توضیح و بنر هر دسته/برند).

**شورت‌کدهای در حال استفاده (تعداد):** yasr_visitor_votes ۱۰۴، simple_toc ۹۸، post-views ۷۰، last_update ۷۰، banovit_related_products ۳۵، banovit_article ۱۳، banovit_products ۹، banowit_festival ۵، archive_description_toggle ۳، custom_breadcrumb ۳، و یک‌دو بار: custom_product_reviews، cwa_product_gallery، product_attributes_list، product_intro_sections، form_builder، mobile_menu، cwa_woo_filters، cwa_product_sorting، cwa_mobile_filters، cwa_results_count، cwa_active_filters، banovit_q، post_categories_list، recent_posts_list، custom_recent_reviews، article_meta_box، article_tags_box، banovit_pricing_table، show_brand_sku، show_brand_sku_link_width، product_cat_tag، cwa_product_options، cwa_product_buy_box، cwa_product_price_box، cwa_banovit_badges، category_menu_button، custom_user_box، site_addons_render، product_featured_image، product_brand_badge، custom_order_tracking، banovit_quiz.

**کران‌ها:** bnv_measurement_process_outbox، bnv_ads_sync، bmp_resync_changed، bdi_sms_daily_reminders، torob_process_pending_product_page_webhooks، wip_auto_change_status_event، pvc_reset_counts.

## ۱۵. یادآوری‌های Ali (به ترتیب)

| تاریخ | یادآوری | کجا ثبت شد |
|---|---|---|
| ۲۰۲۶-۱۱-۰۸ | دسته «روشویی عمومی» انواع محصول متفاوت و فرم محاسبه قیمت دارد | بخش ۱۰، P1، P2 |
| ۲۰۲۶-۱۱-۰۸ | UI فراتر از طرح‌ها باید سبک طرح‌ها را داشته باشد | R1 |
| ۲۰۲۶-۱۱-۰۸ | تصاویر و لوگو از فایل‌های سرور وردپرس؛ تایتل، دیسکریپشن و داده‌های سئو تغییر نکند | R2، R3 |

## ۱۶. سؤال‌های باز برای Ali

1. نرخ درست روشویی عمومی: صفحه متری ۲۵ یا ۳۵ میلیون؟ کلاف و پیشانی متری ۱۰ میلیون اضافه؟ (بخش ۱۰)
2. خروجی فرم روشویی عمومی در سیستم جدید: فقط قیمت تقریبی + ثبت لید، یا خرید آنلاین با قیمت محاسبه‌شده؟
3. «تخفیف شگفت‌انگیز» در طرح PLP دقیقاً چه تعریفی دارد؟
4. تصویر زیردسته‌ها از کجا بیاید (در WP وجود ندارد)؟
5. آدرس و مختصات واقعی دفتر/انبار برای صفحه تماس؟
6. تخفیف پلکانی (P12) که الان در کد خاموش است در سیستم جدید ساخته شود؟
7. پیام «علت فنی» روی محصولات variable روشویی عمومی در لایو (P7) را اصلاح کنم؟ (تغییر لایو، نیاز به تأیید دستی)
