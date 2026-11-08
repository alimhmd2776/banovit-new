# حفظ سئو (SEO parity)

اصل: **هر URL که امروز در نقشه سایت یا ایندکس گوگل است، روز cutover یا همان آدرس با 200 است یا 301 به معادل.** هیچ 404 تصادفی.

## نگاشت URL

| الگوی فعلی | مثال | مسیر Next.js | نکته |
|---|---|---|---|
| `/` | | `app/page.tsx` | |
| `/shop/` | | `app/shop/page.tsx` | آرشیو همه محصولات |
| `/shop/{product}/` | `/shop/sangsanbatis-washbasin-salvia/` | `app/shop/[slug]/page.tsx` | تداخل با `category` و `tag` نمی‌کند چون آن‌ها پیشوند دارند |
| `/shop/category/{slug}/` | `/shop/category/cabinet-vanity/` | `app/shop/category/[...path]/page.tsx` | URL کانونیکال لایو **تخت** است (فقط slug خود دسته)، حتی برای زیردسته‌ها. مسیر تودرتو (`/shop/category/vanity/cabinet-vanity/`) باید 301 به نسخه تخت بخورد |
| `/shop/tag/{slug}/` | | `app/shop/tag/[slug]/page.tsx` | |
| `/brand/{slug}/` | `/brand/alka/` | `app/brand/[slug]/page.tsx` | از `pa_brand` |
| `/brands/{slug}/` | | 301 به `/brand/{slug}/` | `product_brand` تقریباً خالی است |
| `/{attr}/{term}/` (۷۸ ویژگی دیگر) | `/color/white/` | 301 به دسته با فیلتر یا noindex | در نقشه سایت نیستند؛ قبل از تصمیم، داده GSC بررسی شود |
| `/blog/` | | `app/blog/page.tsx` | |
| `/blog/{slug}/` | `/blog/golsar-vs-morvarid-toilet/` | `app/blog/[slug]/page.tsx` | |
| `/blog/category/{slug}/`، `/blog/tag/{slug}/` | | | |
| `/author/{slug}/` | | `app/author/[slug]/page.tsx` | ۳ نویسنده در نقشه |
| `/{page}/` | `/about-us/`، `/contact-us/` | `app/[page]/page.tsx` (catch-all آخر) | |
| `/landing/{slug}/` | `/landing/b2b/` | `app/landing/[slug]/page.tsx` | |
| `.../page/{n}/` | | پارامتر صفحه در همان route | canonical خودارجاع |
| `/cart/`، `/checkout/`، `/my-account/...`، `/login/`، `/login-b2b/`، `/track-order/` | | همان مسیرها | noindex |

- **اسلش انتهایی**: همه URLها با `/` تمام می‌شوند (`trailingSlash: true` در Next.js) مثل امروز.
- slugهای فارسی (percent-encoded) همان‌طور حفظ می‌شوند؛ مقایسه بعد از decode.
- پارامترهای فیلتر (`filter_*`، `cwa_*`، `orderby`، `min_price`، ...): صفحه با `noindex, follow` و canonical به دسته تمیز، مثل mu-plugin فعلی. فرمت پارامترهای جدید فیلتر را می‌شود تمیزتر کرد، ولی پارامترهای قدیمی باید یا پشتیبانی یا به معادل جدید 301 شوند.
- `/feed/` بلاگ: یک RSS ساده برای `/blog/feed/`؛ بقیه feedها 301 به صفحه والد.

## ریدایرکت‌ها

ترتیب ارزیابی در middleware نکست (با lookup از جدول `redirects` که در Redis/edge config کش می‌شود):
1. ۱۸۱ ریدایرکت Yoast (`audit/data/yoast-redirects.json`) شامل ۴ مورد 410
2. ۱۴۸۰ ردیف `_wp_old_slug` (محصول و پست) از `slug_history`
3. نگاشت‌های ساختاری (`/brands/` → `/brand/`، attachment pageها → فایل یا محصول والد، `?p=ID` و `?product=` → URL کانونیکال)
4. بقیه: 404 واقعی با صفحه 404 مفید (جستجو + دسته‌ها)

## متا و محتوای head

- عنوان و توضیح از `seo_meta` (منتقل‌شده از Yoast). جایی که خالی است، الگوی Yoast فعلی (`wpseo_titles`، جداکننده «-») با همان فرمول بازتولید می‌شود تا عنوان‌ها عوض نشوند.
- canonical، robots، og:*، twitter:* هم‌ارز Yoast. `hreflang` لازم نیست (تک‌زبانه، `lang="fa" dir="rtl"`).
- breadcrumb هم در UI و هم JSON-LD، با primary category فعلی (`_yoast_wpseo_primary_product_cat`).

## داده ساخت‌یافته (JSON-LD)

| صفحه | نوع |
|---|---|
| محصول | Product + Offer/AggregateOffer (قیمت ریال IRR یا تومان مثل فعلی، availability، priceValidUntil)، AggregateRating فقط وقتی review واقعی هست، brand، sku، shippingDetails و MerchantReturnPolicy (مثل Schema Pro) |
| دسته/برند | CollectionPage + ItemList + BreadcrumbList |
| بلاگ | BlogPosting/Article + FAQPage وقتی FAQ دارد |
| خانه | Organization + WebSite (SearchAction) + LocalBusiness |

قبل از cutover، خروجی JSON-LD هر نوع صفحه با Rich Results Test و مقایسه با لایو بررسی می‌شود.

## نقشه سایت و robots

- همان نام‌ها و ساختار Yoast: `/sitemap_index.xml`، `/product-sitemap.xml`، `/product-sitemap2.xml`، `/post-sitemap.xml`، `/page-sitemap.xml`، `/product_cat-sitemap.xml`، `/product_tag-sitemap.xml`، `/category-sitemap.xml`، `/pa_brand-sitemap.xml`، `/author-sitemap.xml` (حداکثر ۱۰۰۰ URL در هر فایل، `lastmod` واقعی). با ISR تولید و با تغییر محتوا باطل می‌شوند.
- `robots.txt` با همان قواعد فعلی (Baidu، add-to-cart، جستجو) و آدرس sitemap.
- IndexNow (Yoast الان کلید دارد) برای ping بعد از انتشار.

## پذیرش (قبل از cutover)

1. crawler (Screaming Frog یا اسکریپت) روی همه ۱۸۷۲ URL در `audit/data/url-inventory.csv` + ۱۶۶۱ ریدایرکت: هر کدام 200 یا یک 301 به 200 (بدون زنجیره).
2. diff عنوان، توضیح، canonical، robots و H1 هر URL بین لایو و جدید: صفر اختلاف ناخواسته.
3. Core Web Vitals موبایل (LCP < 2.5s، CLS < 0.1، INP < 200ms) روی ۲۰ قالب پرترافیک.
4. پس از cutover: پایش روزانه GSC (Coverage، 404ها) تا ۴ هفته.
