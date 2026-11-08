# قرارداد ورود و ثبت‌نام مشتری (موبایل + کد پیامکی ۴ رقمی)

منبع حقیقت: [`packages/api-client/openapi/storefront-v1.yaml`](../../packages/api-client/openapi/storefront-v1.yaml) (تگ `auth`). پیاده‌سازی: banovit-cms شاخه `feature/storefront-auth` (از `feature/storefront-plp`)، وب: شاخه `feature/web-auth` (از `feature/web-plp`). طرح‌ها: `designs/auth/` روی شاخه `designs`.

## رفتار فعلی وردپرس (مرجع سازگاری)

افزونه `collection-festival` 3.6 (پچ بانویت 3.5.1، `includes/class-ajax.php`):

- کد ۴ رقمی `random_int`، انقضای ۵ دقیقه، ۵ تلاش اشتباه برای هر کد، ۶۰ ثانیه فاصله بین ارسال‌ها، ۵ ارسال در ساعت برای هر شماره و ۲۰ برای هر IP.
- پیامک الگو (`SendByBaseNumber`) ملی‌پیامک با `bf_verify_pattern_id` و متغیر `{0}` = کد.
- پیدا کردن کاربر با موبایل: username بدون صفر (`9121234567`)، username با صفر، سپس متای `billing_phone`. کاربر جدید با username بدون صفر، نقش `customer`، و `billing_phone` + `digits_phone` ساخته می‌شود.
- ورود با رمز هم دارد (`bf_auth_direct_login`)؛ در ویترین جدید فقط OTP است.

## endpointهای CMS (`/api/storefront/v1`)

| مسیر | ورودی | خروجی |
|---|---|---|
| `POST auth/otp` | `{phone}` | `202 {data: {phone, code_length: 4, expires_in: 300, resend_in: 60}}` |
| `POST auth/otp/verify` | `{phone, code}` | `200 {data: {token, token_type, expires_at, is_new, customer}}` |
| `POST auth/logout` | Bearer | `204` |
| `GET me` | Bearer | `{data: customer}` |
| `PATCH me` | Bearer، `{first_name, last_name}` | `{data: customer}` (مرحله «به خانواده بانُویت خوش‌آمدید») |

`customer = {id (ULID), first_name, last_name, name, phone, type: consumer|partner, needs_profile}`.

خطاها در پوشش استاندارد `{error: {code, message, ...}}`:

| کد | HTTP | معنی |
|---|---|---|
| `invalid_phone` | 422 | موبایل ایرانی معتبر نیست |
| `otp_invalid` | 422 | کد اشتباه؛ `attempts_left` |
| `otp_attempts_exceeded` | 422 | ۵ اشتباه؛ کد باطل شد |
| `otp_expired` | 422 | کد منقضی/مصرف‌شده/وجود ندارد |
| `otp_cooldown` | 429 | کمتر از ۶۰ ثانیه از ارسال قبلی؛ `retry_after` و هدر `Retry-After` |
| `too_many_requests` | 429 | سقف ساعتی شماره یا IP |
| `phone_locked` | 429 | ۱۰ کد اشتباه در یک ساعت؛ شماره یک ساعت قفل |

## امنیت

- **بدون افشای حساب**: پاسخ `auth/otp` برای شماره ثبت‌شده و جدید یکسان است؛ `needs_profile` فقط بعد از کد درست برمی‌گردد.
- **کد**: فقط `HMAC-SHA256(APP_KEY, phone|code)` در `customer_otps` ذخیره می‌شود؛ مقایسه با `hash_equals`؛ مصرف و شمارش تلاش اتمیک (`UPDATE ... WHERE consumed_at IS NULL AND attempts < max`)؛ کد جدید کدهای قبلی را باطل می‌کند.
- **محدودیت نرخ** (`config/storefront.php` → `auth.otp`): ارسال ۶۰ ثانیه/شماره، ۵ در ساعت/شماره، ۲۰ در ساعت/IP؛ بررسی ۱۵ در ساعت/شماره و ۶۰ در ساعت/IP؛ قفل شماره بعد از ۱۰ اشتباه؛ و سقف کلی ۳۰ درخواست در دقیقه/IP روی هر دو endpoint.
- **IP بازدیدکننده**: BFF آن را در `X-Client-IP` همراه `X-Storefront-Token` می‌فرستد؛ بدون توکن داخلی این هدر نادیده گرفته می‌شود. BFF خودش IP را از `X-Real-IP` (nginx: `$remote_addr`) می‌خواند، نه از اولین hop `X-Forwarded-For` که دست کاربر است. پشت CDN آروان، nginx باید `real_ip_header ar-real-ip` و `set_real_ip_from` رنج‌های آروان را داشته باشد.
- **توکن**: Sanctum personal access token روی `App\Models\Customer`، ability `customer`، انقضای ۳۰ روز (`STOREFRONT_SESSION_DAYS`). realm جدا: گروه مشتری `auth:sanctum` + `realm:customer`؛ توکن مشتری روی `/api/admin/*` و `/api/supplier/*` خطای 403 می‌گیرد و برعکس (تست دارد).
- **ارسال پیامک** بعد از فرستادن پاسخ (`app()->terminating`) تا مسیر درخواست کند نشود و کد در جدول jobs نماند.
- پاک‌سازی: `model:prune` برای OTPهای بیش از ۷ روز و `sanctum:prune-expired` هر شب.

## درایور پیامک

`STOREFRONT_OTP_DRIVER`:

- `log` (پیش‌فرض): هیچ پیامکی نمی‌رود، کد در `storage/logs/laravel.log` نوشته می‌شود (در production ستاره‌دار). **روی stage2 و محلی همین باید بماند**؛ دیتابیس `new_cms` کپی مشتری‌های واقعی است.
- `melipayamak`: فقط production. حساب از «تنظیمات پیامک» CMS و `STOREFRONT_OTP_PATTERN_ID` = همان `bf_verify_pattern_id` وردپرس.
- `array`: برای تست.

روی stage2 کد را این‌طور ببینید: `docker compose exec cms tail -n 50 storage/logs/laravel.log | grep "Storefront OTP"`.

## تطبیق مشتری‌های فعلی وردپرس

- مشتری‌های WC در `customers` با `normalized_phone` (از `billing.phone`) هستند. ورود با همان شماره **همان ردیف** را برمی‌گرداند، پس سفارش‌ها، کیف پول و لیدها وصل می‌مانند. ترتیب انتخاب مثل `WooCommerceService::findCustomerByPhone`: اول ردیف دارای `wc_customer_id`، بعد کمترین id. ردیف‌های قدیمی بدون `normalized_phone` با `phone` خام هم پیدا می‌شوند.
- حساب‌هایی که افزونه OTP ساخته و `billing_phone` خالی دارند: sync مشتری‌ها از این به بعد موبایل را از username (`9121234567`) برمی‌دارد. برای ردیف‌های قبلی یک‌بار `php artisan wc:sync customers` کامل کافی است.
- شماره جدید: ردیف `customers` با نام «نامشخص» و `needs_profile: true` ساخته می‌شود؛ بعد از `PATCH me` نام کامل ثبت می‌شود. اگر بعداً همان شماره در ووکامرس حساب بسازد، sync فعلی آن را در همین ردیف ادغام می‌کند (guest با همان موبایل).
- `type: partner` (نقش `shop` وردپرس) برگردانده می‌شود تا ویترین بعداً قیمت همکار/مسیر B2B را تصمیم بگیرد.

## وب (Next.js BFF)

- صفحه: `/login/?redirect=/cart/` (`noindex`). موبایل تمام‌صفحه مثل طرح، دسکتاپ کارت وسط زیر هدر سایت. مراحل: موبایل → «درحال ارسال» → کد ۴ خانه (شمارش معکوس ۶۰ ثانیه، «دریافت مجدد») → نام و نام خانوادگی برای مشتری جدید. اسپلش آبی (`01-splash`) مخصوص اپ است و در وب نیست.
- route handlerها: `POST /api/auth/otp/`، `/api/auth/verify/`، `/api/auth/profile/`، `/api/auth/logout/`، `GET /api/auth/me/`. همه POSTها فقط `application/json` و Origin همین سایت (CSRF).
- کوکی `bnv_session`: httpOnly، Secure (در build تولیدی)، SameSite=Lax، path=/، انقضا = `expires_at` توکن. توکن هرگز در JS مرورگر نیست.
- helperهای سمت سرور در `apps/web/src/lib/auth/session.ts`: `getSessionToken()`، `customerHeaders()`، `getCustomer()`، `requireCustomer(nextPath)` (ریدایرکت به `/login/?redirect=`). `redirect` فقط مسیر نسبی همین سایت را می‌پذیرد (`lib/auth/redirect.ts`).
- **ادغام سبد مهمان** (`lib/auth/hooks.ts`، قرارداد با thread سبد): اگر کوکی `bnv_cart` باشد، بعد از ورود `POST /cart/merge {guest_token}` با Bearer مشتری؛ اگر `data.token` برگشت کوکی سبد با آن جایگزین می‌شود. خطا یا 404 ورود را خراب نمی‌کند.
