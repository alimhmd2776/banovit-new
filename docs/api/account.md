# قرارداد حساب کاربری مشتری («داشبورد کاربران و مشتریان»)

منبع حقیقت: [`packages/api-client/openapi/storefront-v1.yaml`](../../packages/api-client/openapi/storefront-v1.yaml)، بلوک `# --- account ---` (تگ `account`). نام‌های TypeScript: `AccountOrder`، `AccountOrderDetail`، `CustomerAddress`، `CustomerAddressInput` (چون `OrderSummary` و `Address` مال checkout هستند). پیاده‌سازی: banovit-cms شاخه `feature/storefront-account`، وب: `feature/web-account`. طرح‌ها: `designs/account/` روی شاخه `designs` (نگاشت فایل‌ها در `designs/README.md`).

همه endpointها زیر `/api/storefront/v1/me/...` با `auth:sanctum` + `realm:customer` + `throttle:storefront-customer` هستند و `Cache-Control: private, no-store` برمی‌گردانند. پول‌ها ریال صحیح (`toman × 10`) هستند، مثل بقیه API.

## مسیرهای وب (همان URLهای WooCommerce)

| صفحه | مسیر | طرح |
|---|---|---|
| داشبورد | `/my-account/` | 01 |
| پروفایل | `/my-account/edit-account/` | 02، 03 |
| سفارش‌ها (جاری/تحویلی/لغو، جستجو) | `/my-account/orders/?tab=&q=` | 04–08 |
| جزئیات سفارش و فاکتور چاپی | `/my-account/orders/{number}/` و `.../invoice/` | 09 |
| آدرس‌ها، افزودن، ویرایش با نقشه | `/my-account/addresses/`، `/new/?redirect=`، `/{id}/` | 21–25 |
| علاقه‌مندی | `/my-account/wishlist/` | 10، 11 |
| بازدیدهای اخیر | `/my-account/recently-viewed/` | 12–14 |
| دیدگاه‌ها | `/my-account/reviews/` | 15–20 |
| اعلانات | `/my-account/notifications/?category=` | 26، 27 |
| پشتیبانی، موضوع، انتخاب سفارش، ثبت گزارش، تیکت | `/my-account/support/?tab=`، `/topics/{topic}/`، `/select-order/`، `/new/?topic=&order=`، `/tickets/{id}/` | 28–39 |

ریدایرکت‌های سازگاری: `/my-account/view-order/{n}/` → `/my-account/orders/{n}/`، `/my-account/edit-address/` → `/my-account/addresses/`. همه صفحات `noindex` و dynamic هستند.

## endpointها

| مسیر | توضیح |
|---|---|
| `GET me/summary` | شمارش سفارش‌ها به تفکیک تب، اعلان خوانده‌نشده، تیکت باز، `identity_complete` |
| `GET/PATCH me/profile` | نام، `national_code` (با checksum)، `birth_date` (جلالی یا میلادی)، ایمیل |
| `GET me/orders?tab=current\|delivered\|cancelled&q=&page=&per_page=` | از `sales_invoices` (شامل تاریخچه وارد‌شده از WP). `meta.counts`. `q` در همه تب‌ها جستجو می‌کند. سفارش‌های test/trash/draft/superseded دیده نمی‌شوند |
| `GET me/orders/{number}` | جزئیات، چهار مرحله (پرداخت شده → درحال آماده‌سازی → ارسال مرسوله → تحویل کالا)، مرسوله‌ها، آدرس، عودت وجه |
| `GET/POST me/addresses`، `PATCH/DELETE me/addresses/{id}` | حداکثر ۲۰ آدرس. اولی پیش‌فرض می‌شود؛ حذف پیش‌فرض، جدیدترین را پیش‌فرض می‌کند. `lat` بین ۲۴–۴۰ و `lng` بین ۴۴–۶۴ |
| `GET me/wishlist?sort=`، `GET me/wishlist/slugs`، `PUT/DELETE me/wishlist/{slug}`، `PUT me/wishlist/settings` | کارت محصول از `storefront_product_index` |
| `GET/POST me/recently-viewed` | ۵۰ بازدید آخر، `q` |
| `GET/POST me/reviews` | دیدگاه‌های مشتری؛ ثبت با وضعیت `pending` و `is_verified_buyer` |
| `GET me/notifications?category=`، `POST me/notifications/read`، `DELETE me/notifications` | `meta.unread` به تفکیک دسته |
| `GET/POST me/tickets`، `GET me/tickets/{id}`، `POST me/tickets/{id}/messages`، `GET me/tickets/{id}/attachments/{message}/{index}` | multipart با `images[]` (حداکثر ۵ عکس، هر کدام ۵MB) |

پنل: `GET/PATCH /api/admin/support-tickets...` (نقش `sales`) برای پاسخ کارشناس؛ پاسخ کارشناس اعلان «پشتیبانی» می‌سازد. رابط admin-app برای تیکت‌ها هنوز ساخته نشده است.

اعلان تغییر وضعیت سفارش: `OrderStatusNotifier` روی تغییر `status`/`fulfillment_status` (به جز سفارش‌های تست و قدیمی‌تر از ۶۰ روز). خاموش‌کردن: `STOREFRONT_NOTIFY_ORDER_STATUS=false`.

## BFF وب

مرورگر فقط `/api/me/{path}/` را صدا می‌زند (`apps/web/src/app/api/me/[...path]/route.ts`). توکن از کوکی httpOnly نشست خوانده می‌شود، مسیرها با فهرست مجاز چک می‌شوند و درخواست‌های تغییر‌دهنده بررسی cross-site دارند. صفحات سرور با `accountGet()` مستقیم به CMS می‌روند.

## نقاط اتصال با threadهای دیگر

- **سبد/checkout (`feature/web-cart`)**: کامپوننت `features/account/AddressForm` با `onSaved` قابل استفاده است؛ `address.id` همان `address_id` checkout است و `CustomerAddress::toSnapshot()` snapshot سفارش را می‌سازد. افزودن آدرس از checkout: `/my-account/addresses/new/?redirect=/checkout/`.
- **PDP**: `trackProductView(slug)` در `features/account/client.ts` و `PUT/DELETE /api/me/wishlist/{slug}/` برای دکمه قلب؛ `GET /api/me/wishlist/slugs/` برای وضعیت قلب در لیست‌ها. جدول `product_reviews` مال PDP است؛ این‌جا با `Schema::hasTable` محافظت شده.
- **نقشه**: Leaflet با `NEXT_PUBLIC_MAP_TILE_URL` و `NEXT_PUBLIC_GEOCODER_URL` (پیش‌فرض OSM و Nominatim؛ برای پروداکشن بهتر است سرویس داخلی مثل نشان یا Map.ir جایگزین شود).

## باقی‌مانده

- تصاویر سه‌بعدی حالت‌های خالی (طرح‌های 08، 10، 12، 19، 22، 26، 34، 36، 38) در uploads وردپرس لایو نیستند؛ طبق قانون رسانه جایشان خالی مانده (`EmptyState` / `ART_SRC`). فایل اصلی را طراح باید بدهد.
- هشدار موجودی/تخفیف علاقه‌مندی‌ها: فقط تنظیم ذخیره می‌شود، job ارسال ساخته نشده.
- احراز هویت کد ملی با شاهکار ساخته نشده (`identity_verified_at` خالی می‌ماند).
- صفحه رهگیری مهمان `/track-order/` در این شاخه نیست.
- رابط پاسخ تیکت در admin-app.
