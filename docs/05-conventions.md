# قراردادها (برای همه threadهای صفحه)

هر thread صفحه این سند را می‌خواند و از آن پیروی می‌کند. تغییر در این قراردادها فقط از thread معماری.

## رسانه و داده سئو از لایو (دستور Ali، ۲۰۲۶-۱۱-۰۸، اجباری)

- **تصاویر، لوگوها، آیکن برندها، بنرها و هر رسانه** از فایل‌های خود وردپرس لایو (`wp-content/uploads/...` روی 45.94.213.49) می‌آیند، با همان فایل اصلی. placeholder، تصویر بازسازی‌شده، تصویر AI یا عکس استوک ممنوع است. اگر رسانه‌ای در وردپرس پیدا نشد، جای خالی بگذار و در thread گزارش کن، چیزی نساز.
- **داده‌های سئو دقیقاً همان لایو می‌ماند**: title، meta description، canonical، robots، فیلدهای Yoast (focus keyword، primary category، og/twitter)، slug و URL، H1، متن alt تصاویر، schema (JSON-LD)، breadcrumb. منبع فقط export از **لایو** است، نه test2 (متای test2 قدیمی است). هیچ thread حق «بهبود» یا بازنویسی این متن‌ها را ندارد؛ هر تغییر سئویی فقط با درخواست صریح Ali.
- محتوای متنی صفحات (توضیح محصول، متن دسته، FAQ، مقاله) هم همان متن لایو است.
- پذیرش هر صفحه شامل diff خودکار title/description/canonical/H1/alt با نسخه لایو همان URL است (فایل 03).

## مالکیت کامپوننت‌های مشترک

- اولین thread صفحه (PLP، شاخه `feature/web-plp`) اسکلت monorepo و این کامپوننت‌های مشترک را می‌سازد، چون طرح‌هایش آن‌ها را نشان می‌دهند: توکن‌های رنگ/فونت/فاصله، `SiteHeader` (با بنر بالای صفحه)، `Breadcrumb`، `BottomNav` موبایل، `SiteFooter`، `ProductCard`، `Pagination`. همه در `packages/ui` (یا `apps/web/src/components/layout` برای layout).
- threadهای بعدی این‌ها را **استفاده یا گسترش** می‌دهند، نه کپی. تغییر ناسازگار در کامپوننت مشترک فقط با هماهنگی thread معماری.
- قبل از ساخت کامپوننت جدید، `packages/ui` را جستجو کن. اگر دو thread هم‌زمان به یک کامپوننت مشترک جدید نیاز دارند، از طریق coordinator هماهنگ شوند تا یکی بسازد.
- کد فقط بعد از رسیدن طرح همان صفحه نوشته می‌شود (دستور Ali، ۲۰۲۶-۱۱-۰۸).

## روال یک thread صفحه

1. ورودی: طرح موبایل (و دسکتاپ اگر هست) از Ali. اگر فقط موبایل آمد، دسکتاپ را با همان کامپوننت‌ها و grid طراحی کن و اسکرین‌شات برای تأیید بفرست.
2. فهرست داده‌های صفحه را بنویس و قرارداد API را در `docs/api/{page}.md` ثبت کن (یا endpoint موجود را استفاده کن). قرارداد جدید یعنی تغییر در banovit-cms روی شاخه `feature/storefront-{page}`.
3. کامپوننت‌های عمومی را در `packages/ui` و کامپوننت‌های مختص صفحه را در `apps/web/src/features/{page}/` بساز.
4. سئوی صفحه طبق [03-seo-parity.md](03-seo-parity.md): مسیر، `generateMetadata`، JSON-LD، canonical.
5. پذیرش: تایپ‌چک و تست سبز، اسکرین‌شات ۳۷۵ و ۱۴۴۰ پیکسل، Lighthouse موبایل ≥ 90، diff متا با لایو.
6. شاخه `feature/web-{page}` در این مخزن، PR به `develop`؛ commit/push فقط با تأیید Ali.

## ایندکس‌نشدن محیط آزمایشی (اجباری)

هر کد ویترین باید پرچم `SITE_INDEXABLE` را رعایت کند (پیش‌فرض `false`): `app/robots.ts` و `app/sitemap.ts` و `generateMetadata` همه از `lib/seo` می‌خوانند و تا `true` نشده، `noindex, nofollow` برمی‌گردانند. هیچ صفحه‌ای متای robots را مستقیم ننویسد. جزئیات در [06-infra-stage2.md](06-infra-stage2.md).

## ساختار کد `apps/web`

```
src/
  app/                     فقط routing، layout، metadata (کم‌حجم)
    (shop)/shop/[slug]/page.tsx
  features/{page}/         کامپوننت‌ها، hooks و منطق مختص هر صفحه
  lib/api/                 wrapper روی packages/api-client (fetch + cache tags)
  lib/seo/                 سازنده‌های metadata و JSON-LD
  styles/
```

- Server Component پیش‌فرض است؛ `"use client"` فقط برای تعامل (سبد، گالری، فیلتر).
- داده فقط از `lib/api` گرفته می‌شود، هرگز `fetch` مستقیم در کامپوننت.
- هر fetch تگ کش دارد: `next: { tags: ['product:123'], revalidate: 3600 }`.

## قرارداد API storefront

- پایه: `https://cms-new.banovit.com/api/storefront/v1` (در تولید `cms.banovit.com`). نسخه در مسیر؛ تغییر ناسازگار یعنی `v2`.
- OpenAPI 3.1 منبع حقیقت است؛ `packages/api-client` از روی آن تولید می‌شود (`pnpm gen:api`). endpoint بدون spec ادغام نمی‌شود.
- JSON با کلیدهای `snake_case`، تاریخ‌ها ISO-8601 با timezone، پول همیشه عدد صحیح ریال: `{ "amount": 125000000, "currency": "IRR" }`. فرمت تومان فقط در UI.
- پاسخ تکی: `{ "data": {...} }`. لیست: `{ "data": [...], "meta": { "page": 1, "per_page": 24, "total": 340 }, "links": {...} }`. صفحه‌بندی cursor برای لیست‌های بزرگ داخلی، page-number برای PLP (به‌خاطر URL سئو).
- خطا: `{ "error": { "code": "out_of_stock", "message": "متن فارسی برای کاربر", "fields": {...} } }` با کد HTTP درست (422 ولیدیشن، 404، 409 تضاد، 429).
- تصاویر: `{ "url", "width", "height", "alt", "blurhash" }`.
- هر پاسخ عمومی هدر `Cache-Control` و `Surrogate-Key` (تگ‌ها) دارد.
- نام‌گذاری endpointها: اسم جمع، بدون فعل: `GET /products/{slug}`، `GET /categories/{path}/products`، `POST /cart/items`.

## design system و کامپوننت‌ها

- توکن‌ها در `packages/ui/tokens` (رنگ، فاصله، شعاع، سایه، تایپوگرافی) به‌صورت CSS variables؛ هیچ رنگ hex در کامپوننت صفحه.
- Tailwind با preset مشترک؛ RTL پیش‌فرض: از ویژگی‌های منطقی (`ps-*`، `me-*`، `start`/`end`) استفاده کن، نه left/right.
- فونت فارسی self-hosted با `next/font/local`، اعداد فارسی در UI (`Intl.NumberFormat('fa-IR')`)، اعداد لاتین در کد و API.
- کامپوننت‌ها: بدون state سراسری؛ props تایپ‌شده؛ هر کامپوننت `packages/ui` یک story یا تست رندر دارد.
- دسترس‌پذیری: هر دکمه/لینک نام قابل‌خواندن، کنتراست AA، فوکوس دیده شود، تصاویر alt.

## ریسپانسیو

- **mobile-first**. breakpointها: `sm 640`، `md 768`، `lg 1024`، `xl 1280`، `2xl 1440`. طرح‌های Ali مرجع موبایل (۳۷۵) هستند.
- محتوای اصلی هر دو نسخه یکی است (برای سئو)؛ فقط چیدمان فرق می‌کند. چیزی را با `display:none` فقط از موبایل حذف نکن مگر تکراری باشد.
- منوی پایین موبایل (bottom nav) و هدر sticky کامپوننت‌های layout هستند، نه هر صفحه.
- تصاویر با `sizes` درست؛ LCP صفحه `priority` دارد.

## اندازه‌گیری (analytics)

- یک لایه `lib/analytics` با رویدادهای استاندارد GA4 ecommerce (`view_item`، `add_to_cart`، `begin_checkout`، `purchase`، ...) که dataLayer را پر می‌کند. GTM و Matomo مثل لایو. صفحه‌ها مستقیم gtag صدا نمی‌زنند.

## git و نسخه

- این مخزن: `main` (تولید)، `develop`، `feature/*`. Conventional Commits. پیام commit می‌تواند فارسی باشد.
- banovit-cms: git-flow و قواعد CLAUDE.md همان مخزن (هیچ commit/push بدون تأیید، هیچ تست روی DB اصلی).
