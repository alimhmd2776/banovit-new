# یکپارچه‌سازی و استقرار روی stage2

چند thread هم‌زمان روی یک ویترین و یک CMS کار می‌کنند. برای اینکه هیچ thread کار دیگری را روی stage2 پاک نکند، این روال اجباری است.

## شاخه‌های یکپارچه (integration)

| مخزن | شاخه یکپارچه | پایه |
|---|---|---|
| banovit-new | `develop` | `main` + همه `feature/web-*` آماده |
| banovit-cms | `integration/storefront` | `develop` همان مخزن + همه `feature/storefront-*` آماده |

- روی stage2 **فقط HEAD شاخه‌های یکپارچه** مستقر می‌شود، هرگز یک شاخه feature به‌تنهایی (وگرنه کار threadهای دیگر از روی سرور پاک می‌شود).
- شاخه‌های feature همچنان PR جدا به `develop` / `integration/storefront` دارند.

## روال هر thread (به ترتیب)

1. `git fetch` و شاخه feature خودت را روی آخرین شاخه یکپارچه **merge یا rebase کن** و تعارض‌ها را **خودت** حل کن (تو کد خودت را بهتر می‌شناسی).
2. تست: CMS فقط روی sqlite (`php artisan test`، قانون ۱ CLAUDE.md)، web: `pnpm typecheck && pnpm build`.
3. شاخه یکپارچه را با `--no-ff` روی feature خودت merge کن و push کن. اگر push رد شد (non-fast-forward)، از مرحله ۱ تکرار کن. هیچ‌وقت force-push روی شاخه یکپارچه.
4. استقرار با قفل (پایین). بعد از استقرار، smoke test صفحه خودت و یک صفحه دیگر (مثلاً `/shop/`).

## قفل استقرار روی سرور

همه استقرارها داخل این قفل اجرا می‌شوند تا دو thread هم‌زمان مستقر نکنند:

```bash
ssh -i ~/.ssh/id_ed25519 colleague@109.122.247.77
flock -w 900 ~/banovit-new/.deploy.lock -c '<مراحل استقرار در docs/06-infra-stage2.md>'
```

- بعد از هر استقرار یک خط به `~/banovit-new/DEPLOYED.log` اضافه کن: زمان UTC، thread، sha وب، sha CMS، migrationهای اجراشده.
- قبل از استقرار، sha آخرین خط آن فایل باید جد شاخه‌ای باشد که مستقر می‌کنی (`git merge-base --is-ancestor`)؛ اگر نیست، یعنی چیزی را عقب می‌بری. متوقف شو.

## migration

- فقط expand (جدول/ستون جدید، nullable یا با default). هیچ drop/rename در این دوره.
- `php artisan migrate --force` داخل کانتینر `cms`. قبلش dump از `new_cms` در `~/banovit-new/backups/`.
- هرگز `migrate:fresh`، `migrate:rollback` یا `db:wipe` روی `new_cms`.

## فایل‌های مشترکی که مدام تعارض می‌دهند

| فایل | قاعده |
|---|---|
| `packages/api-client/openapi/storefront-v1.yaml` | endpointها و schemaهای هر feature یک بلوک پیوسته با کامنت `# --- {feature} ---`. بعد از merge حتماً YAML را validate کن. |
| `packages/api-client/src/schema.d.ts` | **دستی merge نکن.** بعد از حل تعارض yaml دوباره تولید کن (`pnpm --filter @banovit/api-client gen`). |
| `packages/api-client/src/index.ts` | exportها در بلوک feature خودت |
| `packages/ui/src/icons.tsx` | قبل از افزودن آیکن جستجو کن که وجود نداشته باشد (`IconHeart` دو بار تعریف شده بود) |
| `apps/web/src/components/layout/SiteHeader.tsx` | مالک: thread منو. بقیه فقط از طریق slot/کامپوننت جدا اضافه کنند (مثل `CartBadge`) |
| `routes/storefront.php` (CMS) | هر feature گروه route خودش را دارد؛ به گروه دیگران دست نزن. بعد از merge `php -l` و `php artisan route:list` |
| `config/storefront.php` | هر feature کلید سطح اول خودش را دارد |
| `app/Providers/StorefrontServiceProvider.php`، `routes/console.php` | فقط افزودنی، بلوک feature با کامنت |
