import Link from 'next/link';
import { faDigits } from '@banovit/ui';
import { getContactSettings, getListingSettings } from '@/lib/api';

/**
 * Shared footer (design 01-plp-full-mobile). Every text, link and badge comes
 * from the CMS: «صفحه فروشگاه و فوتر» (about, link columns, badges) and
 * «صفحه تماس با ما» (phones, address, social links + their live icon files).
 */
export async function SiteFooter() {
  const [settings, contact] = await Promise.all([getListingSettings(), getContactSettings().catch(() => null)]);
  const footer = settings?.footer;
  if (!footer) return <footer className="mt-10 pb-[calc(var(--bottom-nav-height)+40px)] lg:pb-0" />;

  const year = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { year: 'numeric' }).format(new Date());
  const address = contact?.locations.find((l) => l.is_primary) ?? contact?.locations[0];

  return (
    <footer className="mt-10 bg-surface pb-[calc(var(--bottom-nav-height)+40px)] lg:border-t lg:border-border lg:pb-0">
      <div className="mx-auto max-w-container px-4 lg:grid lg:grid-cols-[1.4fr_1fr_1fr_auto] lg:gap-10 lg:py-10">
        <div className="space-y-5 border-t border-border py-8 text-center lg:border-0 lg:py-0 lg:text-start">
          <div className="flex items-center justify-center gap-3 lg:justify-start">
            {contact?.logo?.url ? (
              // eslint-disable-next-line @next/next/no-img-element -- original live logo file
              <img src={contact.logo.url} alt="" width={48} height={48} className="size-12 rounded-md object-contain" loading="lazy" />
            ) : null}
            <span className="flex flex-col items-start">
              <span className="text-2xl font-extrabold text-text">{footer.site_name}</span>
              {footer.tagline ? <span className="text-xs text-text-muted">{footer.tagline}</span> : null}
            </span>
          </div>
          {footer.about ? <p className="mx-auto max-w-sm text-sm leading-7 text-text-muted lg:mx-0">{footer.about}</p> : null}

          {contact ? (
            <div className="space-y-3 border-t border-border pt-5 text-sm">
              {contact.phones.length ? (
                <p className="text-text-muted">
                  تلفن پشتیبانی:{' '}
                  {contact.phones.map((p, i) => (
                    <span key={p.tel}>
                      {i > 0 ? (
                        <span className="mx-2 text-text-subtle" aria-hidden="true">
                          •
                        </span>
                      ) : null}
                      <a href={`tel:${p.tel}`} className="font-bold text-text hover:text-primary" dir="ltr" aria-label={`${p.label} ${p.number}`}>
                        {faDigits(p.number)}
                      </a>
                    </span>
                  ))}
                </p>
              ) : null}
              {address ? (
                <p className="text-text-muted">
                  {address.label}: <span className="font-bold text-text">{address.display}</span>
                </p>
              ) : null}
              {contact.socials.length ? (
                <ul className="flex items-center justify-center gap-4 lg:justify-start" aria-label="شبکه‌های اجتماعی">
                  {contact.socials.map((s) => (
                    <li key={s.url}>
                      <a href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.network} className="inline-flex size-9 items-center justify-center hover:opacity-80">
                        {s.icon?.url ? (
                          // eslint-disable-next-line @next/next/no-img-element -- original live icon files
                          <img src={s.icon.url} alt="" width={24} height={24} loading="lazy" />
                        ) : (
                          <span className="text-xs font-bold text-primary">{s.network}</span>
                        )}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
        </div>

        {footer.columns.length ? (
          <div className="grid grid-cols-2 gap-6 border-t border-border py-8 text-center lg:contents lg:text-start">
            {footer.columns.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <p className="mb-5 text-base font-bold text-text">{col.title}</p>
                <ul className="space-y-4 text-sm text-text-muted">
                  {col.links.map((l) => (
                    <li key={`${l.label}-${l.url}`}>
                      <Link href={l.url} className="hover:text-primary">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        ) : null}

        {footer.badges.length ? (
          <div className="flex flex-wrap items-center justify-center gap-4 rounded-lg border border-border p-4 lg:self-start" aria-label="نمادهای اعتماد">
            {footer.badges.map((b) => {
              // eslint-disable-next-line @next/next/no-img-element -- trust seals must load from their issuer
              const img = <img src={b.image} alt={b.label} width={72} height={72} loading="lazy" referrerPolicy="origin" />;
              return b.url ? (
                <a key={b.label} href={b.url} target="_blank" rel="noopener noreferrer" referrerPolicy="origin" className="flex size-20 items-center justify-center">
                  {img}
                </a>
              ) : (
                <span key={b.label} className="flex size-20 items-center justify-center">
                  {img}
                </span>
              );
            })}
          </div>
        ) : null}
      </div>
      {footer.copyright ? (
        <p className="hidden border-t border-border py-4 text-center text-xs text-text-subtle lg:block">{footer.copyright.replace('%%year%%', year)}</p>
      ) : null}
    </footer>
  );
}
