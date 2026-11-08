# API منو (هدر، مگامنو، منوهای موبایل)

مالک: thread منو. کد CMS روی شاخه `feature/storefront-menu` (بر پایه `feature/storefront-plp`)، ویترین روی `feature/web-menu`.

## منبع داده در وردپرس (قبل از مهاجرت)

منوی دسته‌بندی سایت فعلی افزونه جدا ندارد؛ داخل قالب `hello-elementor/functions.php` است:

| وردپرس | CMS |
|---|---|
| «محصولات › تنظیمات منوی دسته‌بندی»: option `cwa_sidebar_tree_structure` (درخت `{id, active, children}` از term id دسته‌ها و تگ‌ها، چیدمان با کشیدن) | منوی `categories` در جدول‌های `storefront_menus` و `storefront_menu_items` |
| تیک فعال/غیرفعال هر آیتم | `is_active` |
| term meta `category-icon-url` (آیکن SVG دسته) | `icon` روی آیتم |
| تصویر شاخص دسته (thumbnail) | `categories.image` (ایمپورت PLP)؛ قابل جایگزینی با `image` آیتم |
| لینک‌های هدر المنتور (پنل همکاران، بلاگ، پیگیری سفارش، ...) | منوهای `header_top`، `header_nav`، `mobile_quick` |

رفتار متفاوت عمدی: وردپرس هر دسته/تگ تازه‌ای را که در تنظیمات ذخیره نشده خودکار به ریشه منو اضافه می‌کند. CMS این کار را نمی‌کند؛ آیتم جدید را مدیر در «منوهای فروشگاه» اضافه می‌کند.

انتقال: `wp eval-file scripts/wp-export-category-menu.php > menu.json` روی وردپرس، سپس `php artisan storefront:import-wp-menu menu.json` (بر اساس slug، قابل اجرای مجدد). لینک‌های پیش‌فرض هدر: `php artisan storefront:seed-header-menus` (فقط اگر خالی باشند).

## مدیریت در CMS

پنل ادمین › «سایت جدید › منوهای فروشگاه» (`/panel/storefront-menus`)، برای مدیر کل و مارکتینگ. درخت تا ۳ سطح، جابه‌جایی بالا/پایین و سطح، نوع لینک (دسته، تگ، لینک دلخواه)، عنوان و تصویر جایگزین، آیکن، نمایش تعداد، برجسته، فعال، و برای دسته‌های سطح ۱ بنر تبلیغاتی پایین منوی موبایل. API ادمین: `GET/PUT /api/admin/storefront-menus/{key}` (کل درخت در یک درخواست).

بعد از ذخیره، CMS به `POST {web}/api/revalidate` با تگ‌های `menu` و `menu:{key}` خبر می‌دهد (`STOREFRONT_REVALIDATE_URL` و `STOREFRONT_REVALIDATE_SECRET` در env CMS؛ خالی یعنی فقط TTL ده دقیقه‌ای).

## `GET /api/storefront/v1/menus/{key}`

`key`: `categories` | `header_nav` | `header_top` | `mobile_quick`. کش: `Surrogate-Key: menu menu:{key}`.

```json
{
  "data": {
    "key": "categories",
    "name": "منوی دسته‌بندی محصولات (مگامنو و منوی موبایل)",
    "items": [
      {
        "id": 21,
        "title": "شیرآلات",
        "url": "/shop/category/faucets/",
        "image": { "url": "https://banovit.com/wp-content/uploads/...jpg", "alt": null },
        "icon": "https://banovit.com/wp-content/uploads/2026/07/faucet_10801905-1.svg",
        "product_count": 435,
        "highlight": false,
        "promo": { "image_url": "...", "title": "با بانویت، نصبش جووووره!", "badge": "خدمات جدید", "button_text": "خرید محصول", "url": "/..." },
        "children": [ { "id": 22, "title": "دوش حمام", "url": "/shop/category/bathroom-shower/", "product_count": 51, "children": [] } ]
      }
    ]
  }
}
```

- `title` و `url` و `product_count` زنده از دسته/تگ خوانده می‌شوند (تعداد = محصولات منتشرشده در زیردرخت، از read model PLP؛ برای تگ از تگ‌های محصولات منتشرشده). کش پاسخ با نسخه کاتالوگ و زمان ویرایش منو عوض می‌شود.
- آیتم غیرفعال، دسته غیرفعال/حذف‌شده، و دسته یا تگ بدون محصول (و بدون زیرمجموعه قابل نمایش) حذف می‌شود.
- `product_count: null` یعنی لینک دلخواه یا «نمایش تعداد» خاموش.
- `icon`: آدرس تصویر، یا نام آیکن داخلی ویترین (`discount`، `bestseller`، `newest`، `track`، `phone`، `article`، `user`).
- لینک تگ‌ها `/shop/tag/{slug}/` است (صفحه تگ هنوز در ویترین ساخته نشده).

## نمایش در ویترین (`apps/web/src/features/menu`)

- سطح ۱ دسته اصلی، سطح ۲ عنوان گروه با «مشاهده همه»، سطح ۳ زیردسته‌ها. فرزندان سطح ۲ بدون زیرمجموعه در یک گروه اول به نام خود دسته اصلی جمع می‌شوند (`groupsOf`).
- موبایل: دکمه منو در هدر → منوی کناری (طرح 07)؛ «دسته بندی» در آن → شیت دسته‌بندی (طرح 02 تا 06) با جستجوی سمت کاربر روی همه سطوح.
- دسکتاپ: نوار بالا (`header_top`)، ردیف ناوبری (`header_nav`) و مگامنو (طرح 01). همه لینک‌های مگامنو در HTML سرور هستند (برای خزنده‌ها، مثل سایت فعلی).
