# یکپارچه‌سازی و استقرار روی stage2

چند thread هم‌زمان روی یک ویترین و یک CMS کار می‌کنند. برای اینکه هیچ thread کار دیگری را روی stage2 پاک نکند، این روال اجباری است.

## شاخه‌های یکپارچه (integration)

| مخزن | شاخه یکپارچه | پایه |
|---|---|---|
| banovit-new | `develop` | `main` + همه `feature/web-*` آماده |
| banovit-cms | `integration/storefront` | `develop` همان مخزن + همه `feature/storefront-*` آماده (نسخه اولیه از شاخه محلی `integration/stage2` در `D:\projects\int-cms` push می‌شود) |

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

## نکات استقرار وب (۲۰۲۶-۱۱-۰۸)

- `web-app` به‌صورت **read-write** mount می‌شود (`./web-app:/app`). Next.js در ISR فایل‌های `.next/server/app/**/*.html` و `.next/cache` را بازنویسی می‌کند؛ با mount فقط‌خواندنی صفحه‌ها کش نمی‌شدند (EROFS). volume جدای `web_next_cache` حذف شد، پس پوشه mountpoint لازم نیست.
- بعد از جایگزینی `web-app`، پوشه‌های `node_modules/@img/sharp-linuxmusl-x64` و `sharp-libvips-linuxmusl-x64` را از نسخه قبلی کپی کن (build روی ویندوز است).
- GitHub از این سیستم فقط **بدون** پروکسی 10.10.10.7:7890 در دسترس است: `env -u HTTPS_PROXY -u https_proxy git -c http.proxy= fetch`.
- داده مرجع لایو: دیتابیس `live_wp_ro` در کانتینر `cms-db` و فایل‌ها در `~/banovit-new/import/`؛ رسانه در `~/banovit-new/media/wp-content/uploads`. برای اجرای اسکریپت‌های `tools/wp-export/*.php` از wp-cli موقت `~/wp-ro` (کد test2 + `wp-config` به `live_wp_ro`) استفاده کن، هرگز روی سرور لایو.

## مالکیت فایل‌ها و اسکریپت‌های استقرار (۲۰۲۶-۱۱-۰۸ ۱۲:۴۰)

- مالک همه فایل‌های `cms-src` و `web-app` کاربر `colleague` است، به‌جز `cms-src/storage`، `cms-src/bootstrap/cache` و `cms-src/vendor` که مالکشان `33:33` (www-data داخل کانتینر) است. اگر جایی root شده بود (مثلاً بعد از `sudo tar` یا `sudo rsync`):
  `sudo chown -R colleague:colleague cms-src web-app && sudo chown -R 33:33 cms-src/storage cms-src/bootstrap/cache cms-src/vendor`
- کد CMS را با `git archive <sha> > cms-<sha>.tar` بساز و روی سرور `sudo tar -xf cms-<sha>.tar -C cms-src` و بلافاصله دستور chown بالا. اگر rsync لازم است: `sudo rsync -a --exclude=/vendor/ --exclude=/storage/ --exclude=/bootstrap/cache/` و بعد chown. هرگز rsync بدون sudo (نیمه‌کاره می‌ماند و کد مخلوط می‌شود).
- وب: `infra/stage2/deploy-web.sh <sha> <thread>` (روی سرور `~/banovit-new/deploy-web.sh`) داخل قفل: `flock -w 600 .deploy.lock bash deploy-web.sh <sha> <thread>`. فایل `web-<sha>.tgz` باید از قبل کنار آن باشد (build محلی طبق «به‌روزرسانی» در docs/06). اسکریپت sharp لینوکسی را منتقل می‌کند، مالکیت را درست می‌کند، smoke test می‌زند و در DEPLOYED.log ثبت می‌کند.
- بررسی یکدستی CMS: `git archive <sha>` را در `/tmp` باز کن و `md5sum -c` روی `cms-src` (به‌جز storage و bootstrap/cache) بزن؛ نباید FAILED بدهد. آخرین بررسی ۱۲:۳۷Z: cms-src = 6e6da16، هیچ اختلافی.
- **داده لایو دیگر تازه‌سازی نمی‌شود** (دستور Ali ۱۲:۳۱): فقط با داده فعلی stage2 کار کنید؛ همگام‌سازی نهایی بعد از تکمیل پیاده‌سازی.

## قفل ضد عقب‌گرد (۲۰۲۶-۱۱-۰۸ ۲۲:۴۰، بعد از race ساعت ۲۲:۱۰)

- `deploy-cms.sh` و `deploy-web.sh` حالا sha مستقرشده را در `~/banovit-new/state/cms_sha` و `state/web_sha` نگه می‌دارند و **فقط وقتی اجرا می‌شوند که `EXPECT_PREV=<sha فعلی>` بدهی**:
  ```bash
  ssh ... 'cat ~/banovit-new/state/cms_sha'          # مثلاً 354b073
  git merge-base --is-ancestor 354b073 <sha جدید>     # باید موفق باشد؛ اگر نه، اول integration را merge کن
  ssh ... 'cd ~/banovit-new && flock -w 1200 .deploy.lock env EXPECT_PREV=354b073 bash deploy-cms.sh <sha جدید> <thread>'
  ```
  اگر کسی بین بررسی و اجرا مستقر کرده باشد، اسکریپت با exit 3 متوقف می‌شود. `FORCE_DEPLOY=1` فقط برای rollback عمدی.
- فقط HEAD شاخه‌های یکپارچه را مستقر کن، هرگز شاخه feature.
- `reval.sh [tag...]` فقط کش Next.js را باطل می‌کند و دیگر چیزی در DEPLOYED.log نمی‌نویسد.
- قبل از استقرار md5 فایل آپلودشده را با فایل محلی مقایسه کن (scp از این سیستم گاهی ناقص می‌شود).
- پشتیبان کد CMS با `sudo tar` و بدون `storage` گرفته می‌شود.
