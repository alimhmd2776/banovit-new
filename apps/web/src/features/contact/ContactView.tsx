import Image from 'next/image';
import type { ContactSettings } from '@banovit/api-client';
import { IconBuilding, IconMail, IconMapFold, IconNavigation, IconPhone, IconWarehouse, cx } from '@banovit/ui';
import { ContactForm } from './ContactForm';
import { displayPhone, osmEmbedUrl } from './format';

const SOCIAL_NAMES: Record<string, string> = {
  whatsapp: 'واتس‌اپ',
  telegram: 'تلگرام',
  instagram: 'اینستاگرام',
  bale: 'بله',
  rubika: 'روبیکا',
  eitaa: 'ایتا',
  aparat: 'آپارات',
  linkedin: 'لینکدین',
};

type Logo = ContactSettings['logo'];

const LOCATION_ICON = { office: IconBuilding, warehouse: IconWarehouse, store: IconMapFold } as const;

/**
 * /contact-us/ from designs/contact (01 desktop 1440, 02 mobile 393).
 * Mobile order: intro, form, info cards, map, socials, hours.
 * Desktop: [intro | hours] / [cards + map | form] / [map link | socials].
 */
export function ContactView({ s }: { s: ContactSettings }) {
  return (
    <div className="mx-auto max-w-container px-4 pb-6 lg:pb-12">
      {/* mobile page bar (the site header stays above it) */}
      {/* mobile page bar. The live page has no H1 (SEO parity), so this is only an H1 when the CMS sets one. */}
      <div className="-mx-4 mb-6 border-b border-border px-4 py-3 lg:hidden">
        <p className="text-lg font-bold text-text">تماس با ما</p>
        <p className="text-xs text-text-muted">تیم تخصصی و فنی بانویت</p>
      </div>
      {s.seo.h1 ? <h1 className="sr-only">{s.seo.h1}</h1> : null}

      <div className="grid gap-4 lg:mt-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,530px)] lg:gap-x-5 lg:gap-y-6">
        <Intro s={s} />

        <section aria-label={s.form.title} className="rounded-lg border border-border bg-surface p-4 lg:col-start-2 lg:row-start-2 lg:p-6">
          <ContactForm
            title={s.form.title}
            messagePlaceholder={s.form.message_placeholder ?? null}
            submitLabel={s.form.submit_label}
            successMessage={s.form.success_message}
          />
        </section>

        <div className="flex flex-col gap-4 lg:col-start-1 lg:row-start-2 lg:gap-5">
          <InfoCards s={s} />
          <MapCard s={s} />
        </div>

        <div className="hidden lg:col-start-1 lg:row-start-3 lg:block">
          <MapLink s={s} className="inline-flex" />
        </div>

        <Socials s={s} className="justify-center lg:col-start-2 lg:row-start-3 lg:justify-end lg:self-center" />

        <Hours s={s} />
      </div>
    </div>
  );
}

/** Brand mark = the original logo file from live uploads (CMS «لوگوی صفحه»); empty slot when not set. */
function BrandMark({ logo, size, className }: { logo: Logo; size: number; className?: string }) {
  if (!logo?.url) return <span aria-hidden="true" className={cx('inline-block shrink-0', className)} style={{ width: size, height: size }} />;
  return (
    <Image
      src={logo.url}
      alt={logo.alt ?? 'بانویت'}
      width={size}
      height={size}
      className={cx('shrink-0 rounded-full object-contain', className)}
    />
  );
}

function Intro({ s }: { s: ContactSettings }) {
  return (
    <section className="flex flex-col items-center gap-3 text-center lg:col-start-1 lg:row-start-1 lg:flex-row lg:items-center lg:gap-4 lg:text-start">
      <BrandMark logo={s.logo ?? null} size={88} className="size-[88px] lg:size-14" />
      <div>
        <h2 className="text-xl font-bold text-text lg:text-2xl">{s.heading}</h2>
        {s.intro ? <p className="mt-1 text-sm text-text-muted lg:text-base">{s.intro}</p> : null}
      </div>
    </section>
  );
}

function Hours({ s }: { s: ContactSettings }) {
  if (!s.hours_title && !s.hours_note) return null;
  return (
    <section className="text-center lg:col-start-2 lg:row-start-1 lg:self-center lg:text-end">
      {s.hours_title ? <h2 className="text-base font-bold text-text">{s.hours_title}</h2> : null}
      {s.hours_note ? <p className="mx-auto mt-1 max-w-md text-xs leading-6 text-text-muted lg:me-0 lg:ms-auto lg:text-sm lg:leading-6">{s.hours_note}</p> : null}
    </section>
  );
}

function InfoCards({ s }: { s: ContactSettings }) {
  const card = 'flex items-center justify-between gap-3 rounded-lg border border-border bg-surface p-4 lg:flex-col-reverse lg:items-start lg:justify-end lg:gap-3';
  return (
    // DOM order = desktop right→left (locations…, phone); mobile shows it reversed (phone first) like the design.
    <ul className="flex flex-col-reverse gap-3 lg:grid lg:grid-cols-3 lg:gap-5" aria-label="اطلاعات تماس">
      {s.locations.map((l) => {
        const Icon = LOCATION_ICON[l.icon];
        return (
          <li key={l.label} className={card}>
            <address className="not-italic">
              <span className="block text-sm font-bold leading-7 text-text">{l.display}</span>
              <span className="block text-xs text-text-muted">{l.label}</span>
            </address>
            <Icon size={28} className="shrink-0 text-primary" />
          </li>
        );
      })}
      <li className={card}>
        <div>
          <p className="flex flex-wrap items-center gap-x-2 text-sm font-bold leading-7 text-text">
            {s.phones.map((p, i) => (
              <span key={p.tel} className="inline-flex items-center gap-2">
                {i > 0 ? <span aria-hidden="true" className="size-1 rounded-full bg-text-subtle" /> : null}
                <a href={`tel:${p.tel}`} dir="ltr" className="hover:text-primary" aria-label={`تماس با ${p.label}: ${displayPhone(p.number)}`}>
                  {displayPhone(p.number)}
                </a>
              </span>
            ))}
          </p>
          <p className="text-xs text-text-muted">تلفن پشتیبانی</p>
          {s.email ? (
            <a href={`mailto:${s.email}`} className="mt-1 inline-flex items-center gap-1 text-xs text-primary" dir="ltr">
              <IconMail size={14} />
              {s.email}
            </a>
          ) : null}
        </div>
        <IconPhone size={28} className="shrink-0 text-primary" />
      </li>
    </ul>
  );
}

function MapLink({ s, className }: { s: ContactSettings; className?: string }) {
  const neshan = s.map.neshan_url;
  return (
    <a
      href={neshan ?? s.map.directions_url}
      target="_blank"
      rel="noopener noreferrer"
      className={cx(
        'items-center gap-2 rounded-full border border-border bg-surface px-5 py-3 text-sm font-bold text-text shadow-sm hover:border-primary hover:text-primary lg:text-base',
        className,
      )}
    >
      <IconNavigation size={18} className="text-primary" />
      {neshan ? 'ورود به نشان' : 'مسیریابی'}
    </a>
  );
}

function MapCard({ s }: { s: ContactSettings }) {
  const primary = s.locations.find((l) => l.is_primary) ?? s.locations[0];
  const hasCoords = s.map.lat != null && s.map.lng != null;
  const label = `موقعیت بانویت روی نقشه: ${primary?.display ?? ''}`;

  return (
    <div className="relative h-60 overflow-hidden rounded-lg border border-border bg-surface-muted lg:h-[250px]">
      {s.map.image ? (
        <Image
          src={s.map.image.url}
          alt={s.map.image.alt ?? label}
          fill
          sizes="(min-width: 1024px) 760px, 100vw"
          className="object-cover"
        />
      ) : hasCoords ? (
        // Non-interactive preview (no scroll trap on phones); the card opens the map app.
        <iframe
          title={label}
          src={osmEmbedUrl(s.map.lat!, s.map.lng!, s.map.zoom)}
          loading="lazy"
          tabIndex={-1}
          aria-hidden="true"
          className="pointer-events-none size-full border-0 grayscale-[15%]"
        />
      ) : (
        <div className="flex size-full flex-col items-center justify-center gap-2 px-6 text-center text-text-muted">
          <IconMapFold size={40} className="text-primary" />
          <p className="text-sm">{primary?.display}</p>
        </div>
      )}

      {hasCoords || s.map.image ? (
        <span className="pointer-events-none absolute left-1/2 top-1/2 inline-flex -translate-x-1/2 -translate-y-[140%] items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-on shadow-md">
          <BrandMark logo={s.logo ?? null} size={24} className="size-6 bg-surface" />
          {s.map.pin_label ?? 'بانویت'}
        </span>
      ) : null}

      {/* whole card is the link; mobile shows the button on the map like the design */}
      <a
        href={s.map.neshan_url ?? s.map.directions_url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${label} (باز کردن در ${s.map.neshan_url ? 'نشان' : 'نقشه'})`}
        className="absolute inset-0"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-3 end-3 inline-flex items-center gap-2 rounded-full bg-surface px-5 py-3 text-sm font-bold text-text shadow-md lg:hidden"
      >
        <IconNavigation size={18} className="text-primary" />
        {s.map.neshan_url ? 'ورود به نشان' : 'مسیریابی'}
      </span>
    </div>
  );
}

function Socials({ s, className }: { s: ContactSettings; className?: string }) {
  if (!s.socials.length) return null;
  return (
    <ul className={cx('flex items-center gap-2', className)} aria-label="بانویت در شبکه‌های اجتماعی">
      {s.socials.map(({ network, url, icon }) => {
        const name = SOCIAL_NAMES[network] ?? network;
        return (
          <li key={url}>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer me"
              aria-label={`بانویت در ${name}`}
              className="inline-flex h-10 min-w-10 items-center justify-center rounded-full px-1 text-xs font-medium text-primary hover:bg-primary-subtle"
            >
              {icon?.url ? (
                // eslint-disable-next-line @next/next/no-img-element -- original live SVG/PNG, tiny, no optimisation needed
                <img src={icon.url} alt="" width={24} height={24} loading="lazy" className="size-6 object-contain" />
              ) : (
                name
              )}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
