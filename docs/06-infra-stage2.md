# زیرساخت آزمایشی روی stage2

سرور: 109.122.247.77 (۲ هسته، ۳.۸ گیگ رم). سرویس‌های موجود (`banovit-clones`: stage2/test2، Plane، okr، ai) دست نمی‌خورند.

## ساب‌دامین‌ها

| ساب‌دامین | نقش | پورت loopback | وضعیت |
|---|---|---|---|
| `new.banovit.com` | ویترین Next.js | 127.0.0.1:8110 | فعال: HTTPS، noindex (بدون رمز) |
| `cms-new.banovit.com` | banovit-cms نسخه جدید (API + admin-app) | 127.0.0.1:8111 | فعال: HTTPS، noindex (بدون رمز) |
| `supplier-new.banovit.com` | پنل تأمین‌کننده جدید | 127.0.0.1:8112 | فعال: HTTPS، noindex (بدون رمز) |

- compose project جدا: `banovit-new` در `~colleague/banovit-new` (فایل‌ها در `infra/stage2/`). بعداً به `/opt/banovit-new` منتقل می‌شود (نیاز به sudo).
- همه با `noindex`. basic auth به درخواست Ali (۲۰۲۶-۱۱-۰۸) برداشته شد؛ پشتیبان vhostها در `/root/backups/`.
- `cms-new` روی دیتابیس جدا `new_cms` (کپی از `stage2_cms`) و Redis جدا اجرا می‌شود تا کار مهاجرت stage2 فعلی را به هم نزند. همان قواعد سیاه‌چاله DNS برای سرویس‌های لایو (پیامک، ترب، ...) اعمال می‌شود.
- مسیرهای API که Next.js سمت سرور صدا می‌زند از داخل سرور به `127.0.0.1:8111` می‌روند، پس basic auth جلویشان نیست.

## جلوگیری از خزش و ایندکس (الزامی تا روز cutover، دستور Ali)

سه لایه مستقل، که هر کدام به‌تنهایی کافی است (basic auth به درخواست Ali حذف شد):
1. **robots.txt** با `Disallow: /` روی هر سه ساب‌دامین (در nginx میزبان بدون basic auth سرو می‌شود تا ربات‌ها ببینند).
2. **هدر `X-Robots-Tag: noindex, nofollow, noarchive, nosnippet`** هم در nginx میزبان و هم در nginx داخل کانتینر (`infra/stage2/noindex.conf`) روی همه پاسخ‌ها، حتی فایل‌ها و API.
3. **پرچم محیطی در Next.js**: `SITE_INDEXABLE=false` (پیش‌فرض). تا وقتی `true` نشده: `robots.txt` و `sitemap` اپ Disallow/خالی، متای `robots` همه صفحات `noindex, nofollow`، و canonicalها به دامنه خودش (نه banovit.com). فقط در استقرار تولیدی روز cutover و با تأیید Ali روی `true` می‌رود.

وضعیت فعلی: لایه ۱ و ۲ روی کانتینرها فعال و تست شده‌اند. لایه‌های nginx میزبان (۱، ۲، ۳) با فعال‌شدن vhostها اعمال می‌شوند. هیچ‌کدام از این ساب‌دامین‌ها در Google Search Console ثبت نمی‌شوند و به نقشه سایت لایو اضافه نمی‌شوند.

## وضعیت راه‌اندازی (۲۰۲۶-۱۱-۰۸)

- DNS: رکوردهای A در آروان برای `new`، `cms-new`، `supplier-new` به 109.122.247.77 (بدون CDN)
- nginx میزبان: vhostهای `infra/stage2/nginx/*` در `/etc/nginx/sites-available` + گواهی Let's Encrypt (certbot، تمدید خودکار)، redirect از HTTP به HTTPS. پشتیبان قبلی nginx در `/root/backups/nginx-*.tgz`.
- کاربر colleague اکنون sudo بدون رمز دارد (`/etc/sudoers.d/90-colleague`).
- تست شد: robots.txt بدون رمز با Disallow کامل، هدر X-Robots-Tag روی همه پاسخ‌ها. سایت‌های stage2، test2، plane، okr و ai بدون تغییر.

## استقرار PLP (۲۰۲۶-۱۱-۰۸، thread صفحه دسته‌بندی)

سرویس‌های placeholder وب و CMS در `~colleague/banovit-new` با پشته واقعی جایگزین شدند (`infra/stage2/compose.yaml`، شبکه جدا `banovit_new`، روی همه سرویس‌ها `mem_limit`):

| سرویس | چیست | حافظه |
|---|---|---|
| `web` | Next.js standalone روی `node:24-alpine`، کد در `./web-app` (فقط‌خواندنی)، پورت 127.0.0.1:8110 | 384m |
| `cms` | php8.3-fpm (image `banovit-clones/cms`)، کد شاخه `feature/storefront-plp` در `./cms-src` | 384m |
| `cms-http` | nginx جلوی CMS (`infra/stage2/nginx-cms.conf`، با X-Robots-Tag و robots بسته)، پورت 127.0.0.1:8111 | 64m |
| `cms-db` | MariaDB 10.11 **جدا** (volume `banovit_new_cms_db`)، دیتابیس `new_cms` کپی از `stage2_cms` | 384m |
| `cms-redis` | Redis جدا برای کش/سشن CMS | 64m |
| `supplier` | همان placeholder | 64m |

- DB جدا داخل همین پروژه است تا MariaDB مشترک banovit-clones دست نخورد. کپی با `mariadb-dump` فقط‌خواندنی از `stage2_cms` انجام شد.
- ایمنی مثل banovit-clones: `x-blackhole` (پیامک، ترب، بله، دامنه‌های لایو) روی CMS، `MAIL_MAILER=log`، در دیتابیس `sms_settings`/`bale_settings` خاموش و توکن‌ها null، همه `notification_templates` خاموش. scheduler اجرا نمی‌شود و صف `sync` است. WC همان کلید فقط‌خواندنی test2 (از `.env` استیج).
- سرویس `web` به `banovit.com` نیاز دارد (بهینه‌سازی تصاویر محصولات)، پس blackhole ندارد؛ جز API داخلی CMS به جای دیگری درخواست نمی‌زند.
- رازها در `~/banovit-new/secrets/` (۶۰۰): `cms.env` (کپی `.env` استیج + override)، `cms-db.env`، `web.env` (`STOREFRONT_INTERNAL_TOKEN`، `REVALIDATE_SECRET`). داخل مخزن نیستند.
- لایه‌های noindex: `SITE_ENV=staging` و `SITE_INDEXABLE=false` در web (متای robots، هدر X-Robots-Tag، `robots.txt` با `Disallow: /`، canonical به خود new.banovit.com)، به‌اضافه nginx میزبان.

### به‌روزرسانی

1. build وب روی سیستم محلی (نه روی stage2): `git archive` شاخه در یک پوشه موقت، `pnpm install --config.node-linker=hoisted` (روی ویندوز standalone با symlinkهای pnpm کپی نمی‌شود)، `SITE_ENV=staging NEXT_PUBLIC_SITE_URL=https://new.banovit.com pnpm --filter @banovit/web build`، کپی `.next/static` به `standalone/apps/web/.next/static`، جایگزینی `@img/sharp-win32-x64` با `sharp-linuxmusl-x64` (`npm install --os=linux --libc=musl --cpu=x64 sharp@0.33.5`)، tar و انتقال به `~/banovit-new/web-app`.
2. CMS: `git archive feature/storefront-plp` + `composer install --no-dev -o`، انتقال به `~/banovit-new/cms-src`، سپس `sudo chown -R 33:33 cms-src/storage cms-src/bootstrap/cache`.
3. `docker compose up -d`، سپس `docker compose exec -u www-data cms php artisan migrate --force` و `php artisan storefront:reindex` و `config:cache`.
4. داده وردپرس: `storefront:import-wp-export import/wp-plp-export.json --live-urls=import/url-inventory.csv` (خروجی فعلی از test2 است؛ قبل از cutover از لایو گرفته شود).

نسخه مستقر: banovit-new `feature/web-plp`، banovit-cms `feature/storefront-plp`. نسخه قبلی compose در `~/banovit-new/backups/`.

محدودیت فعلی: admin-app (پنل `/panel`) روی cms-new build نشده، فقط API فروشگاه فعال است. موجودی همه محصولات در `stage2_cms` «ناموجود» است، پس روی new.banovit.com همه کارت‌ها «ناموجود» نشان داده می‌شوند.

## ظرفیت

stage2 برای آزمون عملکرد کافی نیست (Next.js build حدود ۱.۵ گیگ رم می‌خواهد؛ build روی CI یا سیستم محلی انجام و image آماده منتقل می‌شود). آزمون بار فاز ۶ روی زیرساخت تولید هدف انجام می‌شود.
