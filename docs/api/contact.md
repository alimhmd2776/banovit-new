# API صفحه «تماس با ما» (`/contact-us/`)

مسیر ویترین: `apps/web/src/app/contact-us/page.tsx` (همان URL وردپرس، با اسلش انتهایی). طرح: `designs/contact/` (شاخه `designs`).

| endpoint | کاربرد | کش |
|---|---|---|
| `GET /settings/contact` | همه محتوای صفحه: عنوان و زیرعنوان، ساعت پاسخگویی (متن + ساختاریافته برای اسکیما)، تلفن‌ها، ایمیل، آدرس‌ها، نقشه، متن فرم، شبکه‌های اجتماعی، سئو | تگ Next `settings:contact` (revalidate ۳۰۰ ثانیه)، `Surrogate-Key: settings:contact` |
| `POST /callback-requests` | فرم «درخواست مشاوره» با `form=contact` + `name` + `message` → سیگنال لید `callback_request` در CMS («درخواست تماس از سایت») | از طریق BFF `/api/callback-requests/`، بدون کش |

اسکیمای کامل در `packages/api-client/openapi/storefront-v1.yaml` (`ContactSettings`، `CallbackRequest`).

## ویرایش در CMS

پنل ادمین → «محتوای سایت جدید» → «صفحه تماس با ما» (`/panel/storefront/contact`)، برای مدیر کل و مارکتینگ.
API ادمین: `GET|PUT /api/admin/storefront/contact-settings` (کل سند جایگزین می‌شود). ذخیره در جدول `storefront_settings` با کلید `contact_page`؛ هر فیلدی که ذخیره نشده از پیش‌فرض‌های `App\Domain\Content\ContactPage::DEFAULTS` می‌آید. ذخیره، تگ `settings:contact` سایت را فوراً revalidate می‌کند.

همه متن و تصویر صفحه از همین‌جا می‌آید و صفحه هیچ متنی را hardcode نمی‌کند: نوار بالای موبایل (`page_bar`)، عنوان و زیرعنوان، ساعت‌ها، تلفن‌ها و متن زیرشان (`phones_caption`)، آدرس‌ها، نقشه و متن دکمه‌هایش (`map.neshan_label`، `map.directions_label`)، شبکه‌های اجتماعی (نام نمایشی، لینک، آیکن)، همه متن‌های فرم (عنوان فیلدها، placeholderها، دکمه‌ها، پیام موفقیت و همه پیام‌های خطا در `form.*`)، لوگو و سئو.
تصاویر (لوگو، آیکن‌ها، تصویر نقشه، og:image) با «کتابخانه رسانه» CMS انتخاب یا بارگذاری می‌شوند.

### بعد از خاموش شدن وردپرس

پیش‌فرض تصاویر هنوز آدرس `banovit.com/wp-content/uploads/...` است (برابری با لایو). در روز cutover:

```bash
php artisan storefront:contact-import-media --media-dir=~/banovit-new/media/wp-content/uploads [--dry-run]
```

فایل‌های اصلی را از کپی محلی uploads به کتابخانه رسانه CMS می‌برد و آدرس‌ها را در تنظیمات عوض می‌کند (تکرارپذیر؛ فایل ناموجود گزارش می‌شود و دست نمی‌خورد). چون آدرس og:image عوض می‌شود، قبل از cutover اجرا نشود.

## سئو

- عنوان/توضیح/canonical/robots/og/H1/JSON-LD از بخش «سئو» همان صفحه ادمین. پیش‌فرض‌ها عیناً head لایو (اسنپ‌شات ۲۰۲۶-۱۱-۰۸، `D:\LFA\Stage2\wp-pages-export\contact-us.html`): title و og:title «تماس با ما در بانویت»، description «صفحه تماس با ما در بانویت»، canonical `https://banovit.com/contact-us/`، og:type article، og:image همان rubika-icon.png.
- لایو H1 ندارد، پس صفحه H1 ندارد (`seo.h1` خالی). نوار بالای موبایل `<p>` است.
- JSON-LD: دو بلاک لایو (گراف Yoast و LocalBusiness افزونه Schema Pro) عیناً از `seo.json_ld`؛ اگر خالی شود، از فیلدها ساخته می‌شود (`ContactPage`، `Organization`، `HomeGoodsStore`، `BreadcrumbList`).
- ساعت کاری پیش‌فرض از LocalBusiness لایو: شنبه تا چهارشنبه ۸ تا ۱۸، پنجشنبه ۸ تا ۱۵. لایو مختصات (geo) و نقشه ندارد.

## نقشه

اولویت: تصویر نقشه از ادمین (`map.image`) → پیش‌نمایش غیرتعاملی OpenStreetMap با مختصات (`map.lat/lng`) → بدون مختصات، فقط آدرس. کل کارت نقشه لینک به `map.neshan_url` («ورود به نشان») یا مسیریابی گوگل است.
