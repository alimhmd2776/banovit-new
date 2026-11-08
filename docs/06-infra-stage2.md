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

## ظرفیت

stage2 برای آزمون عملکرد کافی نیست (Next.js build حدود ۱.۵ گیگ رم می‌خواهد؛ build روی CI یا سیستم محلی انجام و image آماده منتقل می‌شود). آزمون بار فاز ۶ روی زیرساخت تولید هدف انجام می‌شود.
