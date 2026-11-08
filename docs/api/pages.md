# قرارداد API: برگه‌های محتوایی (CMS pages)

سیستم مشترک همه برگه‌های ثابت وردپرس (نوع «page»): درباره ما، روش‌های ارسال، شرایط و قوانین، حریم خصوصی، روش‌های پرداخت و ... . پیاده‌سازی: banovit-cms شاخه `feature/storefront-pages`، ویترین: `feature/web-pages`.

## Endpointها

| مسیر | خروجی | کش |
|---|---|---|
| `GET /api/storefront/v1/pages` | `{data: PageListItem[]}` همه برگه‌های منتشرشده (path، url، title، indexable، updated_at) برای page-sitemap | `Surrogate-Key: pages` |
| `GET /api/storefront/v1/pages/{path}` | `{data: ContentPage}`؛ `path` بدون اسلش‌های دو طرف، کدشده یا نشده (`about-us`، `landing/b2b`، `پیش-فاکتور-سبد-خرید`). پیش‌نویس، خصوصی، آینده و حذف‌شده: 404 | `Surrogate-Key: pages page:{id}` |

`ContentPage`: `id, title (H1), slug, path, url, template (default|document|feature), excerpt, hero_image, blocks[], body_html, published_at, updated_at, breadcrumb[{name,url}], seo, faqs`. اگر `blocks` خالی باشد ویترین `body_html` (HTML پاک‌سازی‌شده) را نشان می‌دهد.

## بلوک‌ها (`{id, type, v:1, props}`)

منبع حقیقت: `App\Domain\Content\Blocks\BlockRegistry` در CMS (همان schema اعتبارسنجی، پاک‌سازی HTML و فرم ادمین را می‌سازد). در ویترین: `apps/web/src/features/pages/types.ts` و `blocks.tsx`.

`rich_text`، `hero`، `brand_intro`، `section_heading`، `accordion`، `feature_list` (cards|panel|tiles|rules)، `link_list` (ردیف‌هایی که برگه بازشو با بلوک‌های تودرتو، یک سطح، دارند)، `notice`، `image`، `steps`، `buttons`، `team`، `brand_logos` (slug برندهای pa_brand؛ نام، لوگو و آدرس سمت سرور از کاتالوگ پر می‌شود)، `testimonials`.

ویترین نوع ناشناخته را نادیده می‌گیرد، پس CMS جدیدتر هرگز ویترین قدیمی را نمی‌شکند.

## ادمین (`/api/admin/content/*`، نقش marketing یا admin)

`GET/POST /pages`، `GET/PUT/DELETE /pages/{id}`، `POST /pages/{id}/restore`، `GET /pages/{id}/revisions`، `GET /pages/{id}/revisions/{rid}`، `POST /pages/{id}/revisions/{rid}/restore`، `GET /block-types`. هر ذخیره یک نسخه (snapshot کامل شامل سئو) می‌سازد؛ `expected_revision` جلوی بازنویسی هم‌زمان را می‌گیرد (409).

## سئو

`seo_meta` با `seoable_type=page`. ورود از وردپرس مقادیری را که Yoast واقعاً چاپ می‌کند (`yoast_head_json`) ذخیره می‌کند؛ اگر خالی باشد قالب Yoast برگه‌ها (`%%title%% در %%sitename%%`) بازسازی می‌شود. JSON-LD: WebPage (AboutPage برای about-us) + BreadcrumbList.

## باطل‌سازی کش

هر ذخیره بعد از commit تگ‌های `pages`، `page:{id}`، `page-path:{path}` را با `POST /api/revalidate` (HMAC) به ویترین می‌فرستد. تنظیم: `STOREFRONT_REVALIDATE_URL`، `STOREFRONT_REVALIDATE_SECRET` در CMS و `REVALIDATE_SECRET` در web.

## ورود از وردپرس

1. خروجی فقط‌خواندنی REST: `tools/wp-export/pages-export.sh > pages.json`
2. در CMS: `php artisan storefront:import-wp-pages pages.json` (چیدمان بلوکی از `database/data/content-pages/*.json`؛ idempotent؛ برگه‌ای که در پنل ویرایش شده دست نمی‌خورد مگر `--force`).

برگه‌های متعلق به routeهای دیگر (cart، checkout، my-account، shop، blog، login، b2b، track-order، landing/*) به‌صورت `private` وارد می‌شوند تا سئوشان در CMS باشد ولی به‌عنوان برگه محتوایی سرو نشوند. صفحه اصلی وارد نمی‌شود.
