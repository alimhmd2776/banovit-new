# طراحی دیتابیس و قواعد تغییر

دیتابیس `banovit_cms` موجود ادامه پیدا می‌کند؛ ماژول‌های جدید جدول‌های جدید با پیشوند ماژول می‌گیرند. جدول‌های موجود (`products`، `product_variations`، `categories`، ...) که الان کپی WooCommerce هستند، با الگوی expand/contract به جدول‌های جدید کاتالوگ منتقل می‌شوند، بدون شکستن admin-app.

## اصول

1. **پول** به ریال و `BIGINT UNSIGNED` (هرگز float/decimal نمایشی). ارز و واحد نمایش (تومان) فقط در لایه نمایش.
2. **شناسه‌ها**: کلید داخلی `BIGINT` افزایشی؛ شناسه عمومی در URL/API برای سفارش و مشتری `ULID` (قابل حدس نبودن). محصول و محتوا با `slug` عمومی می‌شوند.
3. **نگه‌داشتن شناسه‌های وردپرس**: هر رکورد منتقل‌شده ستون `legacy_wp_id` (یکتا، nullable) دارد. برای ریدایرکت، تطبیق سفارش‌های قدیمی و آمار لازم است.
4. **slug**: یکتا در دامنه خودش، و جدول `slug_history` (entity، slug قدیم) که جای `_wp_old_slug` را می‌گیرد و ریدایرکت 301 خودکار می‌دهد.
5. **ایندکس‌ها** بر اساس کوئری واقعی: هر endpoint جدید باید `EXPLAIN` شده باشد؛ کلیدهای خارجی همیشه ایندکس دارند؛ ایندکس ترکیبی برای فیلترهای پرکاربرد (`status, published_at`).
6. **soft delete** فقط جایی که لازم است (محتوا، محصول). سفارش و تراکنش مالی هرگز حذف نمی‌شوند، فقط وضعیت عوض می‌کنند.
7. **JSON** فقط برای داده‌ای که روی آن کوئری/فیلتر نمی‌زنیم (بلوک‌های محتوای صفحه، تنظیمات). ویژگی‌های قابل فیلتر محصول جدول نرمال دارند.
8. **utf8mb4_unicode_ci** همه جا؛ ستون‌های فارسی که جستجو می‌شوند از ایندکس جستجو سرو می‌شوند، نه `LIKE`.

## ماژول‌ها و جدول‌های اصلی

### Catalog
- `brands` (از `pa_brand`)، `categories` (درختی، با `parent_id` + `path` مادی‌شده مثل `vanity/cabinet-vanity` برای URL و کوئری زیرشاخه)
- `products`: نوع (simple/variable)، وضعیت، slug، brand_id، primary_category_id، توضیحات، `legacy_wp_id`
- `product_variants`: SKU (الان یکتا نیست؛ ستون `sku` غیر یکتا + `code` داخلی یکتا)، ابعاد، وزن
- `attributes` (۷۹ مورد، با `is_filterable`، `is_visible`، `has_archive`)، `attribute_values`، `product_attribute_values` و `variant_attribute_values`
- `product_category` (چند به چند)، `product_media` (ترتیب، alt)، `product_addons` (جای Rico addons)، `product_relations` (مرتبط/مکمل)
- **قیمت و موجودی فروشندگان**: جدول `supplier_product_offers` (تصمیم ۲۰۲۶-۱۱-۰۸، از کار stage2 بازنویسی می‌شود روی شاخه `feature/supplier-offers`): supplier_id، product_id، product_variation_id، `unit_key` (`p:<id>`/`v:<id>`، یکتا per supplier)، price ریال، stock، approved_at. هر تغییر فروشنده (فرم یا اکسل) اول در `supplier_offer_submissions` و `..._items` ثبت و با تأیید ادمین روی offers اعمال می‌شود. قیمت/موجودی خود بانویت روی `products`/`product_variations` می‌ماند؛ PDP و facet این دو را ادغام می‌کنند. `price_lists` برای قیمت همکار (B2B).
- **پروفایل عمومی فروشنده**: `storefront_sellers` (۱:۱ با suppliers از طریق supplier_id یکتا و nullable؛ NULL = خود بانویت)، با slug برای `/seller/{slug}/`.

### Content
- `posts` (بلاگ)، `pages`، `landing_pages`: بدنه به‌صورت `blocks` (آرایه JSON با schema نسخه‌دار، مثل `{type:"faq", v:1, props:{...}}`)، به‌اضافه `body_html` برای مقاله‌های منتقل‌شده از Elementor تا وقتی بازنویسی شوند
- `post_categories`، `tags`، `menus` و `menu_items`، `faqs`، `media` (فایل در object storage)

### Seo
- `seo_meta` (polymorphic: title، description، canonical، robots، og_*، focus_keywords، schema_overrides JSON)
- `redirects` (from_path یکتا، to_path، status 301/302/410، hits، last_hit_at)، `slug_history`

### Customer / Checkout / Orders
- `customers` موجود + `customer_addresses`، `customer_otps`
  - `customer_otps` (ساخته‌شده، feature/storefront-auth): `phone`، `code_hash` (HMAC، هرگز خود کد)، `attempts`، `expires_at`، `consumed_at`، `invalidated_at`، `ip`، `user_agent`. ایندکس `(phone, created_at)` و `expires_at`. prune بعد از ۷ روز.
  - ستون‌های جدید `customers` (expand-only): `public_id` (ULID، یکتا)، `first_name`، `last_name`، `phone_verified_at`، `last_login_at`. جزئیات در [api/auth.md](api/auth.md).
- `carts` و `cart_items` (سمت سرور، جای سبد WC و جای «سبد لید»)
- سفارش: `sales_invoices` موجود هسته سفارش است؛ ستون‌های لازم برای سفارش بومی (بدون WC) با migration افزایشی اضافه می‌شود: `source` (`wc`|`storefront`|`admin`)، `public_id`
- `payments` و `gateway_transactions` موجود، `coupons` و `discount_rules` (جای festival-discount)، `shipping_methods`، `delivery_slots` (جای delivery-installation)
- `reviews` (محصول و پست، با امتیاز)، `form_submissions` (به SalesLead موجود وصل می‌شود)

## قواعد migration

1. **expand → migrate → contract**: هر تغییر ناسازگار در سه release جدا: ستون/جدول جدید اضافه (expand)، کد هر دو را می‌نویسد و داده backfill می‌شود، سپس در release بعدی ستون قدیمی حذف (contract). هیچ migration در یک release هم rename و هم drop نمی‌کند.
2. **بدون قفل طولانی**: روی جدول‌های بزرگ (`sales_invoices`، `postmeta` منتقل‌شده، لاگ‌ها) از `ALGORITHM=INSTANT/INPLACE` استفاده یا با gh-ost/pt-osc اجرا. backfill در job صف‌دار و دسته‌ای (chunk ۱۰۰۰)، نه در خود migration.
3. هر migration متد `down()` قابل اجرا دارد، یا صریحاً مستند می‌کند که برگشت‌ناپذیر است.
4. migrationها فقط schema عوض می‌کنند؛ انتقال داده در command جدا (`php artisan migrate:wp ...`) که idempotent و قابل تکرار است.
5. قبل از اجرای migration روی هر سرور: پشتیبان dump، اجرای روی کپی، و طبق CLAUDE.md تأیید Ali.
6. تست‌ها فقط روی sqlite یا دیتابیس تست جدا (قانون ۱ banovit-cms).
7. هر جدول جدید در این فایل ثبت می‌شود (نام، هدف، ایندکس‌ها). در هر PR که schema عوض می‌کند، این سند هم به‌روز می‌شود.

## انتقال داده از WordPress

یک command یک‌طرفه و تکرارپذیر در CMS که مستقیم از dump دیتابیس وردپرس (نه REST) می‌خواند: محصولات، تنوع‌ها، ویژگی‌ها، دسته‌ها، برندها، رسانه (دانلود به object storage)، پست‌ها، صفحات، متای Yoast، Schema Pro، نظرات، redirectها، `_wp_old_slug`. upsert بر اساس `legacy_wp_id`، پس می‌شود تا روز cutover چندبار اجرا کرد.
