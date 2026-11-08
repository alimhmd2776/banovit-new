# معماری هدف

## تصمیم‌های اصلی

1. **یک منبع حقیقت**: banovit-cms (Laravel) تنها سیستم مدیریت است: کاتالوگ، قیمت، موجودی، محتوا (بلاگ، صفحه، لندینگ)، سئو، ریدایرکت، مشتری، سبد، سفارش، پرداخت، ارسال. WordPress/WooCommerce در پایان کامل کنار می‌رود.
2. **مونولیت ماژولار، نه میکروسرویس**: همه بک‌اند در همان مخزن banovit-cms می‌ماند، ولی به ماژول‌های مرزبندی‌شده تقسیم می‌شود (`app/Domain/{Catalog,Content,Seo,Checkout,Customer,...}`). مقیاس با تکثیر افقی همان اپ و جداکردن نقش‌ها (web/API، worker، scheduler) به دست می‌آید، نه با شکستن کد.
3. **سه سطح API جدا** در همان اپ، با auth و rate limit و کش مستقل:
   - `/api/storefront/v1/*`: عمومی و فقط‌خواندنی برای کاتالوگ/محتوا (کش‌پذیر)، به‌اضافه endpointهای جلسه‌دار سبد/checkout/حساب مشتری
   - `/api/admin/*`: موجود (admin-app)
   - `/api/supplier/*`: موجود (پنل تأمین‌کننده)
4. **ویترین Next.js** (App Router، React Server Components). صفحات عمومی به‌صورت ISR تولید و در CDN کش می‌شوند؛ داده‌های شخصی (سبد، قیمت همکار، موجودی لحظه‌ای) سمت کلاینت یا با route handler کوتاه‌عمر.
5. **پنل تأمین‌کننده** به این مخزن منتقل و با design system مشترک بازطراحی می‌شود؛ همچنان SPA (نیاز سئو ندارد) و همان API `Api/SupplierPanel`.

```
                  ┌──────────── Arvan CDN (HTML + assets, stale-while-revalidate) ───────────┐
 کاربر ─────────▶ │  new.banovit.com           supplier-new.banovit.com    cms-new.banovit.com │
                  └───────┬──────────────────────────┬──────────────────────────┬─────────────┘
                          ▼                          ▼                          ▼
                 Next.js (N نسخه, stateless)   SPA استاتیک (nginx)        Laravel API (N نسخه)
                          │  fetch + cache tags      │                          │
                          └──────────────┬───────────┴──────────────────────────┘
                                         ▼
                       Laravel (Octane/FPM) ── Redis (cache, session, queue, locks)
                         │        │                     │
                         │        └── Workers (Horizon) ─┴── Scheduler (یک نسخه)
                         ▼
                 MySQL 8 primary ──▶ replica (خواندن گزارش‌ها و storefront)
                         │
                 Meilisearch / OpenSearch (جستجو و facet کاتالوگ)
                 Object storage (S3-compatible، Arvan) برای رسانه + imgproxy
```

## مقیاس‌پذیری و تحمل بار

هدف: صفحات عمومی بدون برخورد به دیتابیس سرو شوند و هر جزء جداگانه افقی تکثیر شود.

### لایه ویترین (Next.js)

- **ISR با cache tag**: هر صفحه با تگ‌هایی مثل `product:{id}`، `category:{id}`، `post:{id}`، `menu`، `settings` ساخته می‌شود. CMS بعد از هر تغییر (از طریق رویداد در صف) به `POST /api/revalidate` در web با امضای HMAC خبر می‌دهد و فقط همان تگ‌ها باطل می‌شوند. سپس purge هدفمند در Arvan.
- صفحه محصول/دسته/بلاگ/خانه: `revalidate` پیش‌فرض ۱ ساعت + باطل‌سازی رویدادی. پیک ترافیک به CDN می‌خورد.
- قیمت و موجودی که سریع تغییر می‌کنند: در HTML با مقدار آخرین build رندر می‌شوند (برای سئو) و سمت کلاینت از `GET /storefront/v1/products/{id}/live` (TTL ده ثانیه در Redis، کش CDN پنج ثانیه) تازه می‌شوند.
- Next.js stateless است (بدون سشن در حافظه)، با `output: standalone` در Docker، پشت nginx، چند نسخه.
- تصاویر: `next/image` با loader سفارشی به imgproxy/CDN، فرمت AVIF/WebP، اندازه‌های ثابت (۱۶۰، ۳۲۰، ۶۴۰، ۹۶۰، ۱۲۸۰).

### لایه API (Laravel)

- **کش، سشن و صف از driver دیتابیس به Redis** منتقل می‌شوند (الان database است و زیر بار گلوگاه می‌شود).
- **Laravel Octane** (FrankenPHP) برای API storefront؛ FPM برای admin کافی است. هر دو از یک image.
- **Horizon** برای صف‌ها با صف‌های جدا: `revalidate`، `notifications` (SMS)، `sync`، `search-index`، `analytics-outbox`، `default`. کارهای کند (پیامک، ایندکس، فید ترب، webhook) هرگز در مسیر درخواست انجام نمی‌شوند.
- **read model‌های غیرنرمال**: برای storefront جدول/سند آماده‌ی هر محصول (`catalog_product_views` یا مستقیم ایندکس جستجو) که با رویداد به‌روز می‌شود؛ endpointهای عمومی هرگز join سنگین زنده نمی‌زنند.
- **Rate limit** per IP و per session روی endpointهای عمومی، به‌خصوص جستجو/فیلتر (مسئله ربات‌های فیلتر در لایو). ترکیب‌های فیلتر از ایندکس جستجو سرو می‌شوند نه از MySQL.
- **Idempotency** روی ثبت سفارش و پرداخت (`Idempotency-Key` هدر)، و قفل Redis روی رزرو موجودی.
- **Outbox pattern** برای همه رویدادهای خروجی (GA4/Matomo/Ads، Didar، Torob، پیامک): رکورد در همان تراکنش ذخیره، worker ارسال می‌کند. (الگوی `TrackingOutbox` موجود گسترش داده می‌شود.)

### داده و جستجو

- MySQL 8 (یا MariaDB 10.11 فعلی) با یک replica برای خواندن گزارش‌ها و storefront؛ اتصال `read`/`write` در کانفیگ لاراول.
- **Meilisearch** برای جستجو و facet (فارسی، typo-tolerance، فیلتر بر اساس ویژگی‌ها). پیشنهاد اول به‌خاطر سادگی؛ اگر حجم داده خیلی بزرگ شد OpenSearch.
- رسانه در object storage (Arvan S3) نه روی دیسک سرور؛ این شرط تکثیر افقی است.

### ظرفیت هدف (برای آزمون بار)

| سناریو | هدف |
|---|---|
| صفحات عمومی از CDN | بیش از ۹۵٪ hit ratio |
| `GET` storefront (miss) | p95 زیر ۱۵۰ میلی‌ثانیه |
| ثبت سفارش | p95 زیر ۸۰۰ میلی‌ثانیه، بدون فروش بیش از موجودی |
| پیک کمپین | ۵۰ برابر ترافیک عادی (لایو الان حدود ۳۰۰ rpm در پیک) بدون خطای 5xx |

آزمون بار با k6 قبل از هر cutover (فاز ۵ نقشه مهاجرت).

### مشاهده‌پذیری

لاگ ساخت‌یافته JSON، Sentry (یا GlitchTip self-hosted) برای web و API، متریک‌های Horizon و صف، health endpoint برای هر سرویس، هشدار روی نرخ 5xx و طول صف.

## امنیت

- ادمین فقط روی `cms-new` (در نهایت `cms.banovit.com`) و با Sanctum؛ هیچ مسیر ادمینی روی دامنه ویترین.
- auth مشتری: OTP پیامکی (۴ رقمی، مثل لایو فعلی) با محدودیت نرخ و قفل، سشن در کوکی httpOnly روی دامنه ویترین که BFF (route handlerهای Next.js) آن را به توکن API تبدیل می‌کند. توکن هرگز در JavaScript کلاینت نیست.
- CSP، CSRF برای فرم‌ها، ولیدیشن ورودی با Form Request در کدهای جدید storefront.
