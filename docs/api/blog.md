# قرارداد API وبلاگ

منبع حقیقت: [`packages/api-client/openapi/storefront-v1.yaml`](../../packages/api-client/openapi/storefront-v1.yaml). پیاده‌سازی: banovit-cms شاخه `feature/storefront-blog` (`routes/storefront.php` و `app/Http/Controllers/Api/Storefront/V1/BlogController.php`).

## endpointهای عمومی (`/api/storefront/v1`)

| مسیر | کاربرد | صفحه وب |
|---|---|---|
| `GET /blog/home` | لندینگ: hero، پربازدیدترین، تازه‌ترین، بخش‌های تحریریه، پرومو، همه مقالات، تب دسته‌ها، سئو | `/blog/` |
| `GET /blog/posts` | لیست: `page`، `per_page`، `category` (مسیر، شامل زیردسته‌ها مثل وردپرس)، `tag`، `author`، `q`، `sort=newest\|popular` | `/blog/page/N/`، آرشیوها، `/blog/?q=` |
| `GET /blog/posts/{slug}` | مقاله کامل: blocks، toc، FAQ، محصولات مرتبط، مقالات مرتبط، نویسنده، breadcrumb، سئو | `/blog/{slug}/` |
| `POST /blog/posts/{slug}/views` | شمارش بازدید (۱ بار در ۳۰ دقیقه برای هر IP و مقاله) | از BFF `/api/blog-views` |
| `GET /blog/categories`، `/blog/categories/{path}` | تب‌ها، صفحه دسته | `/blog/category/{path}/` |
| `GET /blog/tags/{slug}`، `/blog/authors/{slug}` | صفحه برچسب و نویسنده | `/blog/tag/{slug}/`، `/blog/author/{slug}/` |
| `GET /blog/sitemap/{posts\|categories\|tags\|authors}` | ردیف‌های نقشه سایت با تصویر | `post-sitemap.xml`، `category-sitemap.xml`، `author-sitemap.xml` |

slug قدیمی (در `slug_history`) پاسخ `404` با `error.code = "moved"` و `error.location` می‌دهد و وب 301 می‌کند. مقاله زمان‌بندی‌شده تا `published_at` دیده نمی‌شود؛ `blog:publish-scheduled` هر دقیقه وضعیت را عوض و کش را باطل می‌کند.

## بدنه مقاله

`body_html` پاک‌سازی‌شده (allowlist، iframe فقط aparat/youtube) با idهای ثابت روی h2/h3 برای فهرست مطالب. اجزای داخل متن در ویرایشگر به شکل `<figure data-bv-block="products|note|article|quiz|map" data-*>` ذخیره و در API به `blocks` تایپ‌دار باز می‌شوند: `html`، `products` (`layout: card|carousel`، `badge`، `button`، `button_url`، سند کارت از `storefront_product_index`؛ با `data-category`/`data-tag` پرفروش‌های آن دسته، موجودها اول، هنگام درخواست انتخاب می‌شوند)، `note` (`theme: red|green|orange`)، `article` (کارت «مقاله پیشنهادی»؛ اگر نوشته منتشر نباشد حذف می‌شود)، `quiz` (آزمون چهارگزینه‌ای که در مرورگر تصحیح می‌شود)، `map` (lat/lng/label)، `stat` (`[post-views]`/`[last_update]`: تعداد بازدید یا تاریخ آخرین بروزرسانی). نویسنده‌ها همان شورت‌کدهای سایت فعلی را در ویرایشگر CMS تایپ می‌کنند و هنگام ذخیره به همین بلاک‌ها تبدیل می‌شوند. `[simple_toc]` حذف می‌شود چون صفحه فهرست مطالب خودش را فقط از h2 می‌سازد (مثل لایو).

`sidebar` نوشته همان ستون کناری قالب «تک پست» لایو است: `banners` (بنرهای مخصوص هر نوشته از `_sb_custom_banners`، اسلایدر محو با ۴ ثانیه)، فهرست مطالب «فهرست مطالب این مقاله» (فقط دسکتاپ، جمع‌شده در ۱۷۰px)، `recent_posts` (۵ نوشته آخر) و `recent_comments` (۴ نظر تأییدشده آخر کل سایت، از نوشته‌ها و محصولات).

## سئو (هم‌ارز Yoast)

`seo_meta` خود مقاله اولویت دارد، وگرنه قالب‌های `wpseo_titles` (در `blog_settings`). وب در صفحه‌های `/page/N/` عبارت «صفحه N از M» اضافه می‌کند. JSON-LD یک `@graph` شامل BlogPosting (یا Article)، WebPage، BreadcrumbList، Person، WebSite، Organization و FAQPage. URLهای فارسی با percent-encoding حروف کوچک مثل وردپرس. محیط غیر production همیشه `noindex`.

## admin (`/api/admin/blog`، نقش `marketing`)

posts (CRUD، trash/untrash، revisions و restore، preview، analyze)، categories، tags، authors (با سئو؛ تغییر نام مسیرهای قدیمی زیرشاخه را نگه می‌دارد)، media (upload، alt)، settings.

صفحه‌های admin-app (منوی «وبلاگ»، مدیر کل و مارکتینگ): `/panel/blog/posts` (فهرست با فیلتر وضعیت و دسته)، `/panel/blog/posts/{id}` (ویرایشگر متن غنی با تصویر از کتابخانه، جدول، بلاک محصول و نکته، حالت HTML؛ تب سئو با پیش‌نمایش گوگل؛ FAQ؛ زمان‌بندی؛ نسخه‌ها و بازگردانی)، `/panel/blog/taxonomy` (دسته/برچسب/نویسنده با سئو)، `/panel/blog/settings` (کتابخانه رسانه، بخش‌های لندینگ، بنر نوشته‌ها، قالب‌های Yoast). زمان‌ها از پنل به‌صورت UTC (`…Z`) فرستاده و در CMS به timezone برنامه تبدیل می‌شوند.

## کش و باطل‌سازی

پاسخ‌ها `Cache-Control` و `Surrogate-Key` دارند؛ home با کلید `blog:version` کش می‌شود. هر ذخیره در CMS بعد از commit نسخه را بالا می‌برد و `POST /api/revalidate` امضاشده (HMAC) با تگ‌های `blog` و `blog-post:{slug}` به Next.js می‌فرستد (`STOREFRONT_REVALIDATE_URL`/`_SECRET`).

## ورود از وردپرس

1. روی سرور وردپرس: `wp eval-file tools/wp-export/blog-export.php > blog-export.json` (فقط خواندنی؛ محتوای رندرشده Elementor، Yoast، FAQ، بازدید، old_slugs، دیدگاه‌ها، رسانه).
2. در CMS: `php artisan blog:import-wp blog-export.json --live-urls=audit/data/url-inventory.csv --media-dir=~/banovit-new/media/wp-content/uploads` (منبع: نسخه فقط‌خواندنی لایو `live_wp_ro` روی stage2، نه test2؛ رسانه همان فایل‌های اصلی لایو از کپی محلی، بدون درخواست به سرور لایو. بدون `--media-dir` تصاویر با همان آدرس اصلی banovit.com می‌مانند). HTML المنتور با `LegacyHtmlConverter` تمیز می‌شود (accordion → FAQ، ویجت محصول → بلاک products، alert → note، تصاویر lazy → واقعی). شورت‌کدهای افزونه seo-elementor-widgets سایت فعلی (`[banovit_related_products|products|article|tip|quiz]`) و ویجت‌های المنتوری همان افزونه (نشانگر `<div class="wp-widget" data-widget data-settings>` از خروجی، شامل `banovit_map`) با `LegacyShortcodes` به همین بلاک‌ها تبدیل می‌شوند و `[yasr_*]` حذف می‌شود. در پایان همه URLهای وبلاگ لایو با مسیرهای جدید مقایسه و گزارش می‌شوند.

دیدگاه‌ها وارد می‌شوند ولی چون در طراحی بخش دیدگاه نیست، فعلاً نمایش داده نمی‌شوند.
