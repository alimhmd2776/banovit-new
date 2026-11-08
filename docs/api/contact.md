# API صفحه «تماس با ما» (`/contact-us/`)

مسیر ویترین: `apps/web/src/app/contact-us/page.tsx` (همان URL وردپرس، با اسلش انتهایی). طرح: `designs/contact/` (شاخه `designs`).

| endpoint | کاربرد | کش |
|---|---|---|
| `GET /settings/contact` | همه محتوای صفحه: عنوان و زیرعنوان، ساعت پاسخگویی (متن + ساختاریافته برای اسکیما)، تلفن‌ها، ایمیل، آدرس‌ها، نقشه، متن فرم، شبکه‌های اجتماعی، سئو | تگ Next `settings:contact` (revalidate ۳۰۰ ثانیه)، `Surrogate-Key: settings:contact` |
| `POST /callback-requests` | فرم «درخواست مشاوره» با `form=contact` + `name` + `message` → سیگنال لید `callback_request` در CMS («درخواست تماس از سایت») | از طریق BFF `/api/callback-requests/`، بدون کش |

اسکیمای کامل در `packages/api-client/openapi/storefront-v1.yaml` (`ContactSettings`، `CallbackRequest`).

## ویرایش در CMS

پنل ادمین → «محتوای سایت جدید» → «صفحه تماس با ما» (`/panel/storefront/contact`)، برای مدیر کل و مارکتینگ.
API ادمین: `GET|PUT /api/admin/storefront/contact-settings` (کل سند جایگزین می‌شود). ذخیره در جدول `storefront_settings` با کلید `contact_page`؛ هر فیلدی که ذخیره نشده از پیش‌فرض‌های `App\Domain\Content\ContactPage::DEFAULTS` می‌آید.

## سئو

- عنوان/توضیح/canonical/og از بخش «سئو» همان صفحه ادمین. خالی = الگوی پیش‌فرض Yoast برای برگه‌ها: «تماس با ما - بانویت»، بدون meta description.
- **قبل از cutover**: مقادیر واقعی head صفحه لایو `https://banovit.com/contact-us/` (title، description، og:*) در ادمین وارد و با diff متا مقایسه شود. از محیط ابری دسترسی به banovit.com نبود، پس این مقایسه هنوز انجام نشده.
- JSON-LD: `ContactPage` + `Organization` با همان `@id` یوست (`https://banovit.com/#organization`) به‌اضافه contactPoint، آدرس‌ها و sameAs + `HomeGoodsStore` (LocalBusiness) با آدرس اصلی، تلفن، ساعت کاری و geo (اگر مختصات ثبت شده) + `BreadcrumbList`.
- یک H1 («تماس با ما»): در موبایل نوار عنوان صفحه، در دسکتاپ فقط برای صفحه‌خوان و موتور جستجو (طرح دسکتاپ عنوان صفحه ندارد).

## نقشه

اولویت: تصویر نقشه از ادمین (`map.image`) → پیش‌نمایش غیرتعاملی OpenStreetMap با مختصات (`map.lat/lng`) → بدون مختصات، فقط آدرس. کل کارت نقشه لینک به `map.neshan_url` («ورود به نشان») یا مسیریابی گوگل است.
