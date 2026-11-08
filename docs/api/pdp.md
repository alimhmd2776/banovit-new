# قرارداد API برگه تک محصول (PDP)

منبع حقیقت: [`packages/api-client/openapi/storefront-v1.yaml`](../../packages/api-client/openapi/storefront-v1.yaml) (`ProductDetail`، `ProductLive`، `ReviewListing`). پیاده‌سازی: banovit-cms شاخه `feature/storefront-pdp` (`ProductController`، `App\Domain\Catalog\Detail\ProductDetailService`). طرح: `designs/pdp/` روی شاخه `designs`.

## endpointها

| مسیر | کاربرد | کش |
|---|---|---|
| `GET /products/{slug}` | همه داده صفحه: گالری، H1، breadcrumb (دسته اصلی Yoast)، مشخصات، گزینه‌ها و variantها، افزودنی نصب، امتیاز و ۳ دیدگاه، فروشنده/ارسال، FAQ، محصولات مرتبط، سئو | CDN ۵ دقیقه + `Surrogate-Key: product:{id} products`، کش داخلی با نسخه کاتالوگ |
| `GET /products/{slug}/live` | فقط قیمت و موجودی محصول و همه variantها | ۵ ثانیه CDN، ۱۰ ثانیه Redis |
| `GET /products/{slug}/reviews?page=` | دیدگاه‌های تأییدشده، ۱۰ تایی، + توزیع امتیاز | CDN ۵ دقیقه |
| `POST /products/{slug}/reviews` | ثبت دیدگاه مهمان (`author_name`، `rating`، `body`، `phone` اختیاری) با وضعیت `pending` | محدودیت `storefront-write` |

`{slug}` همان slug بعد از `/shop/` است (decode شده یا percent-encoded). محصول پیش‌نویس یا ناموجود در CMS → 404.

## مدل variation

- `options[]`: محورهای انتخاب از ویژگی‌های WC با `variation: true` (ترتیب مقادیر همان ترتیب محصول). `key` کلید facet (`pa_color`) یا `attr_N` برای ویژگی سفارشی؛ `value` همان slug ترم (همان مقدار `?attribute_pa_color=` وردپرس). `type: swatch` برای رنگ با `hex`.
- `variants[]`: `id` همان `variation_id` سبد، `attributes` {key: value یا null = هر مقدار}، قیمت ریالی، `in_stock`.
- وب: انتخاب پیش‌فرض ارزان‌ترین variant موجود؛ لینک‌های قدیمی `?attribute_pa_x=` بعد از hydrate اعمال می‌شوند تا HTML کش‌شونده بماند؛ انتخاب کاربر با `replaceState` در URL می‌نشیند ولی canonical همیشه آدرس تمیز است. منطق در `apps/web/src/features/pdp/variants.ts` (با تست).

## افزودن به سبد

مرورگر → `POST /api/cart/items/` (BFF شاخه `feature/web-cart`) با `{product_id, variation_id, quantity, addon_ids, installation}`؛ پاسخ 201 `{data: Cart}` یا `{error}`. رویداد `cart:updated` با `{item_count}` روی window. قیمت نصب در سبد = جمع `price` گزینه‌های انتخابی `product_addon_options` همان محصول (هماهنگ‌شده با thread سبد).

## سئو (برابر لایو)

- مسیر `app/shop/[slug]/page.tsx` = `/shop/{slug}/` با اسلش انتهایی؛ کدگذاری/حروف متفاوت همان slug → 301 به `data.path`.
- `generateMetadata`: عنوان/توضیح/canonical/robots/og از `seo_meta` (منتقل‌شده از Yoast) و در نبودش قالب Yoast (`storefront.seo.product_title`). محیط غیر production همیشه `noindex, nofollow`.
- JSON-LD: `WebPage` + `Product` (name، image، description، sku، brand، category، `Offer` با کمترین قیمت به IRR، availability، `priceValidUntil` فقط با تاریخ پایان حراج واقعی؛ بدون قیمت → بدون Offer، مثل mu-plugin `banovit-product-schema-fix`) + `AggregateRating` و `Review` فقط وقتی دیدگاه تأییدشده امتیازدار هست + `BreadcrumbList` + `FAQPage`.
- همه محتوای موبایل در HTML دسکتاپ هم هست؛ «معرفی محصول» کامل در HTML است و فقط ارتفاعش بسته می‌شود.
- ISR: `revalidate` یک ساعت + تگ‌های `products` و `product-slug:{slug}` برای `POST /api/revalidate`.

## داده (banovit-cms، migration `2026_11_08_200001`)

| جدول | منبع وردپرس |
|---|---|
| `product_contents` | `post_content`، `post_excerpt`، ویژگی‌های کلیدی (meta یا `<li>`های توضیح کوتاه)، `_yoast_wpseo_primary_product_cat`، `_sale_price_dates_to` |
| `product_media` | تصویر شاخص + `_product_image_gallery` + تصویر variationها با ابعاد و alt |
| `seo_meta` (morph `product`) | `_yoast_wpseo_*` |
| `product_relations` | upsell → `related`، cross-sell → `complementary` (کمبود با پرفروش‌های دسته اصلی پر می‌شود) |
| `product_reviews` | review های WC با `rating` و `verified`؛ پاسخ‌ها رد می‌شوند؛ وضعیت تعدیل‌شده در CMS با import دوباره عوض نمی‌شود |
| `product_addons` + `product_addon_options` | Rico-wc-addons (`_cwa_*` و پست‌های گروه افزودنی)؛ قیمت ریالی برای هر عدد |
| `faqs` (morph `product`) | meta FAQ محصول؛ اگر نبود، FAQ دسته اصلی نمایش داده می‌شود |

اجرا: روی میزبان وردپرس `wp eval-file tools/wp-export/pdp-export.php > pdp-export.json`، سپس در CMS `php artisan storefront:import-wp-products pdp-export.json` (idempotent، `--only=ID,ID` برای اشکال‌زدایی). خروجی شمارش‌ها را چاپ می‌کند؛ `addons_meta_not_understood` یعنی ساختار meta افزودنی با پارسر نخواند.

## موارد باز

- **ساختار دقیق meta افزونه Rico-wc-addons** دیده نشده (دسترسی وردپرس از cloud نبود)؛ پارسر هر فهرست ردیف دارای label و price را گزینه می‌گیرد. روی test2 یک‌بار اجرا و `addons_meta_not_understood` بررسی شود.
- `og:type` و قالب عنوان/توضیح محصول باید با diff متای لایو تأیید شود (`pdp-export.php` قالب‌های `wpseo_titles` را چاپ می‌کند).
- `shippingDetails` و `MerchantReturnPolicy` اسکیمای Schema Pro هنوز اضافه نشده‌اند چون مقادیرشان در دسترس نبود.
- «بلاگ‌های مفید» تا ساخت ماژول بلاگ خالی است (`related_posts: []`) و بخش پنهان می‌ماند.
- فروشنده/ارسال فعلاً از `config/storefront.php` (`pdp.seller`، `pdp.shipping`) می‌آید تا ماژول offers (چندفروشندگی) آماده شود. علاقه‌مندی (قلب) API ندارد و فعلاً حذف شده است.
- لایک/دیسلایک دیدگاه فقط نمایش داده می‌شود (endpoint رأی ندارد).
