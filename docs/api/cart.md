# سبد خرید و checkout

طرح‌ها: `designs/cart/` (شاخه `designs`). فقط موبایل آمد؛ دسکتاپ با همان کامپوننت‌ها در grid دوستونه (لیست ۸ ستون + خلاصه چسبان ۴ ستون) ساخته شد.

| مسیر | صفحه | طرح |
|---|---|---|
| `/cart/` | سبدخرید من (خالی/پر) | 01، 02 |
| `/checkout/` | تکمیل اطلاعات: آدرس، روز ارسال، بسته‌بندی، نصب، اقلام | 03، 04 (فرم آدرس موقت؛ نقشه = 05، 06 از thread حساب کاربری) |
| `/checkout/payment/` | روش پرداخت، کد تخفیف، جزئیات پرداخت، پیش‌فاکتور | 07 |
| `/checkout/result/` | پرداخت موفق / سفارش ثبت شد / پرداخت ناموفق | 08، 09 |
| `/cart/proforma/` | پیش‌فاکتور قابل چاپ (جایگزین برگه پیش-فاکتور-سبد-خرید) | |

همه noindex (`privatePageMetadata`).

## جریان داده

```
مرورگر ──fetch──▶ Next BFF /api/cart/*، /api/checkout/*  ──(X-Cart-Token از کوکی httpOnly bnv_cart، X-Client-IP، X-Storefront-Token، Bearer bnv_session)──▶ CMS /api/storefront/v1
```

- مرورگر هرگز CMS را مستقیم صدا نمی‌زند. کمک‌کننده‌ها: `features/cart/client.ts` (`addToCart`، `cartApi`).
- هر پاسخ سبد، کل Cart است (قیمت‌ها و جمع‌ها از CMS)، UI هیچ جمعی حساب نمی‌کند.
- کوکی خوانا `bnv_cart_count` فقط تعداد اقلام را دارد تا badge هدر و منوی پایین بدون درخواست کار کند؛ رویداد `cart:updated` با `{item_count}` هم پخش می‌شود.
- بعد از ثبت سفارش: کوکی `bnv_order` = `NUMBER:token` (دسترسی به صفحه نتیجه و «تلاش مجدد»)، `bnv_cart` پاک می‌شود.

## endpointها (CMS، شاخه `feature/storefront-cart`)

| متد | مسیر | توضیح |
|---|---|---|
| GET | `/cart` | سبد فعلی (بدون توکن: سبد خالی با `token: null`؛ مشتری واردشده: آخرین سبد فعالش) |
| POST | `/cart/items` | `{product_id, variation_id\|variant_id, quantity, installation?, addon_ids?}` → 201 + Cart (سبد را اگر نبود می‌سازد) |
| PATCH | `/cart/items/{id}` | `{quantity?, installation?}`؛ quantity=0 حذف |
| DELETE | `/cart/items/{id}` | |
| PATCH | `/cart` | `{address?, address_id?, delivery_date?, packaging?, payment_method?, customer_note?, attribution?}` |
| POST/DELETE | `/cart/coupon` | `{code}` |
| POST | `/cart/merge` | بعد از ورود OTP: `{guest_token}` با Bearer مشتری |
| POST | `/orders` | هدر `Idempotency-Key` اجباری. ثبت سفارش + شروع پرداخت → `{order, access_token, payment}` |
| GET | `/orders/{number}` | هدر `X-Order-Token` (یا Bearer همان مشتری) |
| POST | `/orders/{number}/payments` | پرداخت دوباره سفارش در انتظار پرداخت |
| POST | `/payments/zarinpal/verify` | `{authority, status}` از callback درگاه (route handler `/api/checkout/zarinpal/callback/`) |

قرارداد دقیق: `packages/api-client/openapi/storefront-v1.yaml`. خطاها: `{error:{code,message,fields}}`، کدهای مهم: `variation_required` 422، `out_of_stock` / `no_price` / `cart_full` / `cart_changed` 409، `coupon_invalid|coupon_expired|coupon_used_up|coupon_min_subtotal` 422، `address_required` / `delivery_date_required` / `payment_method_required` 422.

## قابلیت‌های ووکامرس فعلی که حفظ شد

| قابلیت لایو | در سیستم جدید |
|---|---|
| خدمات نصب (Rico addons + banovit-delivery-installation) | `installation` روی هر قلم؛ قیمت از `product_addon_options` (شاخه PDP) اگر `addon_ids` آمده، وگرنه config (`CHECKOUT_INSTALLATION_FEE`، نقشه دسته‌ها). فقط برای محصولات برچسب install/نصب و فقط در منطقه‌هایی که نصب دارند (تهران، استان تهران، کرج) |
| روز ارسال (banovit-delivery-installation) | `DeliverySchedule`: ۷ روز آینده، بدون جمعه و تعطیلات رسمی (`IranianHolidayChecker`)، cutoff ساعت ۱۴، برچسب شمسی |
| حمل‌ونقل (persian-woocommerce-shipping) | منطقه‌ها در `config/checkout.php`: تهران/استان تهران/البرز با پیک و انتخاب روز، بقیه کشور باربری/پست (پس‌کرایه) |
| بسته‌بندی ایمن | `packaging` روی سبد، `CHECKOUT_PACKAGING_FEE` |
| کوپن ووکامرس | جدول `storefront_coupons` (درصدی با سقف، مبلغ ثابت، حداقل خرید، سقف استفاده کل و برای هر موبایل، تاریخ). کوپن QA (`BNVQA100`) هم سفارش را تست علامت می‌زند |
| زرین‌پال (WC_ZPal) | `ZarinpalGateway` (REST v4، ریال). پرداخت موفق = ردیف `payments` (method zarinpal) + `gateway_transactions` + وضعیت «در حال انجام»، دقیقاً مثل سفارش sync‌شده |
| کارت به کارت | سفارش با وضعیت «در انتظار بررسی» (on-hold) |
| اقساط (دیجی‌پی/aghsatpay) | در لیست با «به‌زودی»؛ درایور درگاه هنوز وصل نشده (`CHECKOUT_INSTALLMENTS_ENABLED`) |
| پیش‌فاکتور | `/cart/proforma/` قابل چاپ/PDF |
| فید سبد رهاشده (banovit-lead-carts) | `LeadCollector::collectStorefrontCartSignals` مستقیم از جدول `carts`: سبد فعال با موبایل و بیش از ۶۰ دقیقه بی‌فعالیت = سیگنال `cart_abandoned` (`sfcart:{id}`)، با سفارش یا خالی‌شدن بسته می‌شود |
| attribution سفارش | `PATCH /cart {attribution}` (همان کلیدهای `_bnv_*`)؛ در `raw_payload.meta_data` و `OrderAttributionService` |

## ثبت سفارش در CMS

`OrderPlacer` یک `SalesInvoice` با `source = 'storefront'`، `wc_order_id = null` و شماره `BAN-FA{id}` می‌سازد. مبالغ مثل سفارش‌های ووکامرس به **تومان** (`IRT`) ذخیره می‌شوند؛ `raw_payload` شکل سفارش WC را دارد (billing/shipping/line_items/fee_lines/shipping_lines/coupon_lines/meta_data) و جمع‌ها به ریال در `raw_payload.storefront.totals_rial`. اقلام `SalesInvoiceItem` معمولی‌اند، پس تأیید فروش، زیرسفارش، انبار، سپیدار و ترکینگ بدون تغییر کار می‌کنند. قفل روی سبد + `Idempotency-Key` جلوی سفارش تکراری را می‌گیرد.

## کارهای باز

- نقشه و جستجوی موقعیت (طرح 05، 06) و آدرس‌های ذخیره‌شده: thread حساب کاربری (`AddressForm`، `MapPicker`، `customer_addresses`). `PATCH /cart {address_id}` از الان پشتیبانی می‌شود.
- صفحه مدیریت کوپن‌ها و تنظیمات هزینه‌ها در admin-app (فعلاً config/env).
- ثبت utm/gclid در `localStorage.bnv_attribution` در layout (لایه اندازه‌گیری)؛ checkout آن را می‌خواند.
- درایور اقساط دیجی‌پی.
