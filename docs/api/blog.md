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

`body_html` پاک‌سازی‌شده (allowlist، iframe فقط aparat/youtube) با idهای ثابت روی h2/h3 برای فهرست مطالب. اجزای داخل متن در ویرایشگر به شکل `<figure data-bv-block="products|note" data-*>` ذخیره و در API به `blocks` تایپ‌دار باز می‌شوند: `html`، `products` (`layout: card|carousel`، سند کارت از `storefront_product_index`)، `note`.

## سئو (هم‌ارز Yoast)

`seo_meta` خود مقاله اولویت دارد، وگرنه قالب‌های `wpseo_titles` (در `blog_settings`). وب در صفحه‌های `/page/N/` عبارت «صفحه N از M» اضافه می‌کند. JSON-LD یک `@graph` شامل BlogPosting (یا Article)، WebPage، BreadcrumbList، Person، WebSite، Organization و FAQPage. URLهای فارسی با percent-encoding حروف کوچک مثل وردپرس. محیط غیر production همیشه `noindex`.

## admin (`/api/admin/blog`، نقش `marketing`)

posts (CRUD، trash/untrash، revisions و restore، preview، analyze)، categories، tags، authors (با سئو؛ تغییر نام مسیرهای قدیمی زیرشاخه را نگه می‌دارد)، media (upload، alt)، settings.

## کش و باطل‌سازی

پاسخ‌ها `Cache-Control` و `Surrogate-Key` دارند؛ home با کلید `blog:version` کش می‌شود. هر ذخیره در CMS بعد از commit نسخه را بالا می‌برد و `POST /api/revalidate` امضاشده (HMAC) با تگ‌های `blog` و `blog-post:{slug}` به Next.js می‌فرستد (`STOREFRONT_REVALIDATE_URL`/`_SECRET`).

## ورود از وردپرس

1. روی سرور وردپرس: `wp eval-file tools/wp-export/blog-export.php > blog-export.json` (فقط خواندنی؛ محتوای رندرشده Elementor، Yoast، FAQ، بازدید، old_slugs، دیدگاه‌ها، رسانه).
2. در CMS: `php artisan blog:import-wp blog-export.json --live-urls=audit/data/url-inventory.csv --download-media`. HTML المنتور با `LegacyHtmlConverter` تمیز می‌شود (accordion → FAQ، ویجت محصول → بلاک products، alert → note، تصاویر lazy → واقعی). در پایان همه URLهای وبلاگ لایو با مسیرهای جدید مقایسه و گزارش می‌شوند.

دیدگاه‌ها وارد می‌شوند ولی چون در طراحی بخش دیدگاه نیست، فعلاً نمایش داده نمی‌شوند.
