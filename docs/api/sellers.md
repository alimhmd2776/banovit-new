# قرارداد API برگه فروشنده (پروفایل فروشگاه)

منبع حقیقت: [`packages/api-client/openapi/storefront-v1.yaml`](../../packages/api-client/openapi/storefront-v1.yaml). پیاده‌سازی: banovit-cms شاخه `feature/storefront-sellers` (روی `feature/storefront-plp`). طرح: `designs/sellers/` (فقط موبایل؛ دسکتاپ از همان کامپوننت‌ها).

## endpointها

| مسیر | کاربرد | صفحه وب |
|---|---|---|
| `GET /sellers` | فروشنده‌های عمومی (بانویت اول) | برای برگه فهرست فروشنده‌ها، وقتی طرحش برسد |
| `GET /sellers/{slug}` | سربرگ (لوگو، شعار، آمار)، تب «جزئیات فروشگاه» (درباره، آدرس، lat/lng، ساعت کاری هفتگی)، سئو | `/seller/{slug}/` |
| `GET /sellers/{slug}/products` | تب «محصولات»: همان پارامترها و پاسخ PLP، facet `seller` ثابت | همان، و `/page/N/` |
| `GET /sellers/{slug}/reviews` | تب «نظرات کاربران» | تا ساخت ماژول reviews خالی برمی‌گردد (UI حالت خالی نشان می‌دهد) |

فروشنده‌ای که `is_public` نیست ۴۰۴ است.

## داده (CMS)

- `storefront_sellers`: یک ردیف برای هر فروشنده، ۱:۱ با `suppliers` (همان رکوردی که ادمین و پنل تأمین‌کننده استفاده می‌کنند). `supplier_id = NULL` یعنی خود بانویت (فروشنده خانگی، همه محصولات).
- محصولات هر فروشنده: ایندکسر ردیف `("seller", slug)` در `storefront_product_facets` می‌نویسد. منبع: `supplier_product_offers` (پیشنهادهای تأییدشده؛ شاخه `feature/supplier-offers`) و تا وقتی آن جدول نیست، دامنه برند تأمین‌کننده (`attribute_term_supplier`).
- ویرایش: ادمین `GET/PUT /api/admin/storefront-sellers/{id}` (انتشار، slug)، تأمین‌کننده `GET/PUT /api/supplier/storefront-profile` (محتوا، بدون انتشار). UI هر دو منتظر طرح است.
- `php artisan storefront:sellers --sync` پروفایل جاافتاده‌ها را می‌سازد (تأمین‌کننده‌ها پنهان، بانویت عمومی). `--stats` آمار سربرگ (هر ساعت).
- آمار: فروش بانویت = سفارش‌های `completed`؛ تأمین‌کننده = تخصیص‌های تکمیل‌شده. امتیاز تا ماژول reviews خالی است و در UI نمایش داده نمی‌شود.

## وب

- `apps/web/src/features/sellers/`؛ مسیرها `app/seller/[slug]/` و `app/seller/[slug]/page/[n]/`.
- تب‌ها همه در HTML سرور هستند (فقط `hidden`)، `#reviews` و `#details` لینک‌پذیرند.
- «باز است / بسته است» در مرورگر با ساعت تهران محاسبه می‌شود (HTML کش است).
- JSON-LD: `Store` (آدرس، geo، ساعت کاری، `aggregateRating` فقط با نظر واقعی) + `BreadcrumbList` + `ItemList`.
- سئو: URL جدید است و معادل لایو ندارد. روی stage2 مثل همه صفحات noindex؛ اضافه شدن به نقشه سایت فقط بعد از cutover.

## موارد باز

- نقشه فعلاً iframe اوپن‌استریت‌مپ است؛ وقتی کامپوننت نقشه صفحه تماس آماده شد، همان استفاده شود.
- «علاقه‌مندی» فروشگاه فعلاً فقط در مرورگر ذخیره می‌شود تا API حساب کاربری فهرست فروشگاه‌های محبوب داشته باشد.
- برگه فهرست فروشنده‌ها و «در بانویت بفروشید» در زیپ نبودند.
