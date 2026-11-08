# اتصال فعلی CMS به وردپرس

از کد banovit-cms نسخه 1.4.2 و تنظیمات لایو (۲۰۲۶-۱۱-۰۸). جهت داده تقریباً همیشه **از وردپرس به CMS** است. CMS هیچ درخواست نوشتنی (POST/PUT) به وردپرس نمی‌فرستد.

## ۱. کانال‌ها

| # | کانال | جهت | مکانیزم | کد |
|---|---|---|---|---|
| 1 | سفارش‌ها | WP → CMS | pull از `GET /wp-json/wc/v3/orders?modified_after=` هر ۱۵ دقیقه (`wc:sync all`) + webhook `order.created/updated` به `/api/webhooks/woocommerce/order` | `WooCommerceService::syncOrders/upsertOrder`، `WebhookController` |
| 2 | مشتری‌ها | WP → CMS | pull `/customers` + webhook `customer.created/updated` | `upsertCustomer`؛ نقش `shop` → `type=partner` |
| 3 | محصولات و تنوع‌ها | WP → CMS | pull `/products` و `/products/{id}/variations`؛ webhook `product.created` فعال، `product.updated` **غیرفعال** (پس ویرایش محصول تا ۱۵ دقیقه دیر می‌رسد) | `upsertProduct`، `syncVariationsForProduct` |
| 4 | دسته، برچسب، ویژگی و ترم‌ها | WP → CMS | pull `/products/categories`، `/products/tags`، `/products/attributes/{id}/terms` | `CategorySyncService`، `TagSyncService`، `syncProductAttributeTerms` |
| 5 | پرداخت | WP → CMS | از payload سفارش: زرین‌پال (`WC_ZPal` + `date_paid`) → رکورد `payments`؛ تراکنش‌های درگاه از متای سفارش | `recordZarinpalPaymentIfNeeded`، `GatewayTransactionExtractor` |
| 6 | attribution سفارش | WP → CMS | متای سفارش `_bnv_*` و `_wc_order_attribution_*` (utm، gclid، ga_client_id، matomo، lead_code، deal_id) | `OrderAttributionService::capture` |
| 7 | هویت وب و فرم مشاوره | WP → CMS | افزونه banovit-measurement/attribution با هدر `X-Webhook-Secret` به `/api/webhooks/web-identity` | `WebIdentityWebhookController` |
| 8 | سبدهای رهاشده (لید) | CMS ← WP | CMS هر ۱۵ دقیقه فید `GET /wp-json/banovit/v1/lead-carts` (mu-plugin banovit-lead-carts) را با کلید می‌خواند | `LeadCollector::collectCartSignals` |
| 9 | سلامت سایت | CMS → WP (فقط خواندن HTML) | روزانه ۱۰ صبح صفحات کلیدی و چند محصول را باز می‌کند | `SiteHealthChecker` |
| 10 | لینک‌ها | CMS | آدرس سفارش/محصول در Bale و ترکینگ با `WOOCOMMERCE_BASE_URL` و `TRACKING_ORDER_URL_BASE` ساخته می‌شود | `BaleBotController`، `config/tracking.php` |

احراز هویت REST: کلید ووکامرس با Basic Auth (`WOOCOMMERCE_CONSUMER_KEY/SECRET`). webhookها با `CMS_WEBHOOK_SECRET`.

## ۲. منطق مهمی که در CMS روی داده وردپرس سوار است

- **سفارش = `sales_invoices`** با کلید `wc_order_id`. تا وقتی فروش تأیید نکرده، اقلام در هر sync کامل بازسازی می‌شوند. بعد از تأیید، اقلام «فریز» می‌شوند و هر تغییر اقلام در ووکامرس یک سفارش جایگزین می‌سازد (`OrderEditReplacementService`؛ جریان «کنسل سفارش قدیم و ساخت سفارش جدید» از طریق پیش‌فاکتور). اگر کالا ارسال شده باشد فقط هشدار دستی.
- تغییر وضعیت به لغو/استرداد بعد از تأیید → هشدار زنجیره تأمین و درخواست استرداد برای مالی.
- **موجودی از Aug 2026 فقط در CMS** است و از ووکامرس sync نمی‌شود، ولی قیمت هنوز از ووکامرس می‌آید.
- محصولی که اول بار در یک سفارش دیده شود، فوراً کامل از REST کشیده می‌شود.
- تاریخ‌های شمسی که افزونه فارسی در REST برمی‌گرداند، تشخیص و تبدیل می‌شوند (`parseWcDate`).
- قفل همزمانی برای جلوگیری از تداخل sync زمان‌بندی‌شده و webhook (`withSyncLock`).
- `categories.wc_category_id` با idهای داخل `Product::categories` همیشه یکی نیست؛ تطبیق با slug امن‌تر است.

## ۳. یافته‌های حین ممیزی

- روی لایو دو webhook فعال به `stage.banovit.com` («STAGE - Order created/updated») هست، یعنی سفارش‌های واقعی به سرور stage قدیمی هم می‌روند (داده شخصی مشتری). باید بررسی و احتمالاً غیرفعال شود. **(کار روی لایو، نیاز به تأیید Ali)**
- کلیدهای REST با دسترسی read_write که دیگر استفاده نمی‌شوند: `cms` (آخرین استفاده 2026-07-31)، `cms new` (2026-08-01)، `ai banovit` (هرگز). کلید فعلی CMS «panel cms» فقط read است. پیشنهاد: باطل کردن سه کلید قدیمی. **(نیاز به تأیید Ali)**
- webhook `product.updated` غیرفعال است.

## ۴. سرنوشت هر کانال در معماری جدید

| کانال | دوره انتقال (فاز ۲ و ۳) | بعد از cutover |
|---|---|---|
| کاتالوگ (۳، ۴) | **جهت برعکس می‌شود**: CMS منبع حقیقت، تغییرات با `wc/v3` (کلید read_write جدید و محدود) به ووکامرس push می‌شود تا ویترین قدیمی تا روز cutover درست بماند. pull کاتالوگ خاموش. | حذف |
| سفارش و مشتری (۱، ۲، ۵) | بدون تغییر: ووکامرس هنوز سفارش می‌گیرد | ویترین جدید سفارش را مستقیم در `sales_invoices` با `source=storefront` می‌سازد؛ کل منطق فریز/جایگزینی/زیرسفارش بدون تغییر کار می‌کند چون روی `sales_invoices` است نه ووکامرس. `wc_order_id` برای سفارش‌های قدیمی می‌ماند. |
| attribution (۶) و web-identity (۷) | بدون تغییر | ویترین همان فیلدها را مستقیم به endpoint سفارش و `web-identity` می‌دهد (همان نام‌ها، پس `OrderAttributionService` تغییر کمی دارد) |
| سبد لید (۸) | بدون تغییر | سبد سمت سرور در CMS است؛ `LeadCollector` مستقیم از جدول `carts` می‌خواند |
| سلامت سایت (۹) و لینک‌ها (۱۰) | | `WOOCOMMERCE_BASE_URL` به `STOREFRONT_URL` تغییر نام و SiteHealthChecker صفحات Next.js را چک می‌کند |

نکته طراحی: یک لایه `OrderSource` (interface) در CMS ساخته می‌شود که `WooCommerceOrderSource` (فعلی) و `StorefrontOrderSource` (جدید) هر دو `SalesInvoice` تولید کنند، تا بقیه سیستم (تأمین، انبار، مالی، سپیدار، دیدار) فرقی حس نکند.
