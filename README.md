# بانویت (banovit-new)

بازسازی سایت بانویت: خروج از WordPress/WooCommerce به یک معماری سه‌لایه.

| لایه | فناوری | مخزن | ساب‌دامین آزمایشی (stage2) |
|---|---|---|---|
| ویترین مشتری (storefront) | Next.js (App Router) + React + TypeScript | این مخزن، `apps/web` | `new.banovit.com` |
| CMS و پنل مدیریت (تنها ادمین) | Laravel 12 (banovit-cms) + admin-app | `alimhmd2776/banovit-cms` | `cms-new.banovit.com` |
| پنل تأمین‌کننده | React SPA | این مخزن، `apps/supplier` | `supplier-new.banovit.com` |

## نقشه اسناد

- [docs/01-architecture.md](docs/01-architecture.md): معماری هدف، مقیاس‌پذیری، کش، صف، جستجو
- [docs/02-data-model.md](docs/02-data-model.md): طراحی دیتابیس و قواعد migration
- [docs/03-seo-parity.md](docs/03-seo-parity.md): حفظ سئو (URL، ریدایرکت، متا، نقشه سایت، اسکیما)
- [docs/04-migration-plan.md](docs/04-migration-plan.md): فازبندی مهاجرت و معیار پایان هر فاز
- [docs/05-conventions.md](docs/05-conventions.md): قراردادهای API، کامپوننت، ریسپانسیو و روال thread هر صفحه
- [docs/06-infra-stage2.md](docs/06-infra-stage2.md): ساب‌دامین‌ها و استقرار روی stage2
- [audit/inventory.md](audit/inventory.md): فهرست کامل سایت فعلی (لایو + stage2)
- `audit/data/url-inventory.csv`: همه ۱۸۷۲ آدرس نقشه سایت لایو (۲۰۲۶-۱۱-۰۸)
- `audit/data/yoast-redirects.json`: ۱۸۱ ریدایرکت Yoast Premium

## ساختار مخزن (هدف)

```
apps/
  web/          Next.js storefront (SSR/ISR)
  supplier/     پنل تأمین‌کننده (SPA)
packages/
  ui/           design system مشترک (توکن‌ها، کامپوننت‌ها، RTL)
  api-client/   کلاینت تایپ‌شده تولیدشده از OpenAPI بک‌اند
  config/       eslint/tsconfig/tailwind مشترک
infra/          docker compose، nginx، اسکریپت استقرار stage2
docs/  audit/
```

## قواعد کلیدی

1. هیچ تغییری روی لایو (banovit.com، cms.banovit.com) بدون تأیید دستی Ali.
2. هیچ commit/push در banovit-cms بدون تأیید Ali (قاعده CLAUDE.md آن مخزن).
3. هر صفحه در thread خودش ساخته می‌شود و باید از [docs/05-conventions.md](docs/05-conventions.md) پیروی کند.
