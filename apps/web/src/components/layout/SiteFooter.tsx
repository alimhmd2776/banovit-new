import Link from 'next/link';
import { siteConfig } from '@/lib/site-config';

const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  instagram: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  telegram: <path d="M20.5 4.5L3.5 11l6 2 2 6 3-4 4.5 3.5z M9.5 13l8-6" />,
  whatsapp: (
    <>
      <path d="M4 20l1.3-4A8 8 0 1 1 8 18.8z" />
      <path d="M9 9.5c.5 2 2.5 4 4.5 4.5l1.2-1.2 2 1-.5 1.7c-3.5.3-7.5-3.7-7.2-7.2L10.7 8l1 2z" />
    </>
  ),
  aparat: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="9" cy="9" r="1.6" />
      <circle cx="15" cy="9" r="1.6" />
      <circle cx="9" cy="15" r="1.6" />
      <circle cx="15" cy="15" r="1.6" />
    </>
  ),
};

/**
 * Shared footer (design 01-plp-full-mobile): centered brand block, contact
 * line, social icons, two link columns and the trust badge box on mobile;
 * a four-column row from lg.
 */
export function SiteFooter() {
  return (
    <footer className="mt-10 bg-surface pb-[calc(var(--bottom-nav-height)+40px)] lg:border-t lg:border-border lg:pb-0">
      <div className="mx-auto max-w-container px-4 lg:grid lg:grid-cols-[1.4fr_1fr_1fr_auto] lg:gap-10 lg:py-10">
        <div className="space-y-5 border-t border-border py-8 text-center lg:border-0 lg:py-0 lg:text-start">
          <div className="flex items-center justify-center gap-3 lg:justify-start">
            <span className="flex size-12 items-center justify-center rounded-md bg-primary-subtle text-lg font-extrabold text-primary" aria-hidden="true">
              بان
            </span>
            <span className="flex flex-col items-start">
              <span className="text-2xl font-extrabold text-text">بانویت</span>
              <span className="text-xs text-text-muted">طراوتی نو در خانه تو</span>
            </span>
          </div>
          <p className="mx-auto max-w-sm text-sm leading-7 text-text-muted lg:mx-0">{siteConfig.about}</p>

          <div className="space-y-3 border-t border-border pt-5 text-sm">
            <p className="text-text-muted">
              تلفن پشتیبانی:{' '}
              <a href={`tel:${siteConfig.supportPhone}`} className="font-bold text-text hover:text-primary" dir="ltr">
                {siteConfig.supportPhoneDisplay}
              </a>
              <span className="mx-2 text-text-subtle" aria-hidden="true">
                •
              </span>
              <a href={`tel:${siteConfig.officePhone}`} className="font-bold text-text hover:text-primary" dir="ltr">
                {siteConfig.officePhoneDisplay}
              </a>
            </p>
            <p className="text-text-muted">
              آدرس شرکت: <span className="font-bold text-text">{siteConfig.address}</span>
            </p>
            <ul className="flex items-center justify-center gap-4 lg:justify-start" aria-label="شبکه‌های اجتماعی">
              {siteConfig.social.map((s) => (
                <li key={s.icon}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.name} className="inline-flex size-9 items-center justify-center text-primary hover:text-primary-hover">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
                      {SOCIAL_ICONS[s.icon]}
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 border-t border-border py-8 text-center lg:contents lg:text-start">
          {siteConfig.footerColumns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <p className="mb-5 text-base font-bold text-text">{col.title}</p>
              <ul className="space-y-4 text-sm text-text-muted">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="hover:text-primary">
                      {l.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="flex items-center justify-center gap-4 rounded-lg border border-border p-4 lg:self-start" aria-label="نمادهای اعتماد">
          <a href={siteConfig.enamad.href} target="_blank" rel="noopener noreferrer" referrerPolicy="origin" className="flex size-20 items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element -- enamad requires its own hosted seal image */}
            <img src={siteConfig.enamad.img} alt="نماد اعتماد الکترونیکی" width={72} height={72} loading="lazy" referrerPolicy="origin" />
          </a>
        </div>
      </div>
      <p className="hidden border-t border-border py-4 text-center text-xs text-text-subtle lg:block">
        © {new Intl.DateTimeFormat('fa-IR-u-ca-persian', { year: 'numeric' }).format(new Date())} بانویت. همه حقوق محفوظ است.
      </p>
    </footer>
  );
}
