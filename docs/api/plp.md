# قرارداد API صفحه لیست محصولات (PLP)

منبع حقیقت: [`packages/api-client/openapi/storefront-v1.yaml`](../../packages/api-client/openapi/storefront-v1.yaml). پیاده‌سازی: banovit-cms شاخه `feature/storefront-plp` (`routes/storefront.php`).

## endpointها

| مسیر | کاربرد | صفحه وب |
|---|---|---|
| `GET /categories/{path}` | داده صفحه دسته: breadcrumb، زیردسته‌ها، توضیح سئو، FAQ، متا | `/shop/category/{path}/` |
| `GET /categories/{path}/products` | لیست + facetها | همان، و `/page/N/` |
| `GET /products` | همه محصولات + دسته‌های اصلی | `/shop/` |
| `GET /brands/{slug}` و `/brands/{slug}/products` | صفحه برند | `/brand/{slug}/` |
| `POST /callback-requests` | فرم «تماس بگیرید» → سیگنال لید `callback_request` در CMS | از طریق BFF `/api/callback-requests/` |

پارامترهای لیست: `page`، `per_page` (۱۲/۲۴/۳۶/۴۸)، `sort` (`newest|popular|rating|price_asc|price_desc`)، `brand=a,b`، `filter[pa_x]=a,b`، `min_price`/`max_price` به ریال، `in_stock=1`، `on_sale=1`. مقادیر داخل یک facet «یا»، facetها «و». facet ناشناخته نادیده گرفته می‌شود. حداکثر ۲۰ مقدار انتخابی در هر درخواست.

## URL وب (همان فرمت لایو)

`?orderby=date|popularity|rating|price|price-desc`، `?filter_brand=` (و `cwa_brand` قدیمی)، `?filter_{attr}=`، `?min_price=&max_price=` به تومان، `?in_stock=1`، `?on_sale=1`، صفحه‌بندی در مسیر `/page/N/`. نگاشت در `apps/web/src/features/plp/url-state.ts`.

سئو: URL فیلتردار یا مرتب‌شده `noindex, follow` با canonical دسته تمیز؛ `/page/N/` canonical خودارجاع؛ هر محیط غیر production `noindex, nofollow` + `robots.txt` با `Disallow: /`.

## معماری داده

- **read model**: `storefront_product_index` (یک ردیف برای هر محصول منتشرشده، کلیدهای مرتب‌سازی ایندکس‌دار + سند آماده کارت در `document`) و `storefront_product_facets` (facet, value, product). دسته‌ها با همه اجدادشان در facet `category` ثبت می‌شوند، پس صفحه دسته یک lookup برابری است.
- **موتور جستجو** پشت interface `ProductSearchEngine`: `database` (پیش‌فرض) و `meilisearch` (`STOREFRONT_SEARCH_DRIVER`). facet شمارش disjunctive دارد (شمارش هر facet بدون انتخاب خودش).
- **کش**: نتیجه هر کوئری نرمال‌شده با کلید نسخه کاتالوگ کش می‌شود؛ ایندکسر نسخه را بالا می‌برد. پاسخ‌ها `Cache-Control: s-maxage=300, stale-while-revalidate=600` و `Surrogate-Key` دارند.
- **به‌روزرسانی**: observer روی Product/ProductVariation job صف‌دار `IndexStorefrontProducts`، و `storefront:reindex` ساعتی.
- **فیلترهای هر دسته**: `storefront_facets` (یکی برای هر ویژگی WC؛ `source_names` نام ویژگی‌های CMS را نگاشت می‌کند چون CMS برای هر ویژگی چند ردیف بدون slug دارد) و `storefront_facet_rules` (همان `cwa_category_filter_rules` افزونه فعلی: default، دسته، برند؛ دسته بدون قاعده از نزدیک‌ترین والد ارث می‌برد).
- **ورود داده از وردپرس**: `php artisan storefront:import-wp-export export.json --live-urls=audit/data/url-inventory.csv` (خروجی از `tools/wp-export/plp-export.php` با `wp eval-file`). مسیر دسته از نقشه سایت لایو گرفته می‌شود چون URLهای لایو بیشتر تخت هستند (`/shop/category/cabinet-vanity/`) با اینکه ترم‌ها تودرتو هستند.
- **rate limit**: ۲۴۰ در دقیقه برای هر IP؛ سرور Next.js با `X-Storefront-Token` معاف است. فرم تماس ۵ در دقیقه و ۳۰ در روز.

## موارد باز

- علامت «خدمات نصب» و «تخفیف شگفت‌انگیز» فعلاً از برچسب محصول (`STOREFRONT_INSTALL_TAGS`، `STOREFRONT_AMAZING_TAGS`) خوانده می‌شود؛ منبع واقعی‌اش باید تأیید شود.
- امتیاز (rating) تا انتقال reviews خالی است.
- موجودی: روی stage2 همه محصولات `outofstock` هستند؛ منبع درست موجودی (CMS یا WC) باید مشخص شود.
- قبل از cutover، import باید از خروجی لایو اجرا شود (عنوان‌های Yoast روی test2 قدیمی‌اند).
