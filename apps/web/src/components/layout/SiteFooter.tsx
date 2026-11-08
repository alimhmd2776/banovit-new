import Link from 'next/link';
import { IconPhone } from '@banovit/ui';
import { siteConfig } from '@/lib/site-config';

export function SiteFooter() {
  return (
    <footer className="mt-10 border-t border-border bg-surface pb-[calc(var(--bottom-nav-height)+16px)] lg:pb-0">
      <div className="mx-auto grid max-w-container gap-8 px-4 py-8 md:grid-cols-[2fr_1fr_1fr]">
        <div className="space-y-3">
          <p className="text-xl font-extrabold text-primary">بانویت</p>
          <p className="max-w-md text-sm leading-7 text-text-muted">
            فروشگاه تخصصی شیرآلات، روشویی، لوازم بهداشتی و آشپزخانه؛ ارسال به سراسر کشور.
          </p>
          <a href={`tel:${siteConfig.supportPhone}`} className="inline-flex items-center gap-2 text-sm font-medium text-text hover:text-primary">
            <IconPhone size={18} />
            <span dir="ltr">{siteConfig.supportPhoneDisplay}</span>
          </a>
        </div>
        {siteConfig.footerColumns.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <p className="mb-3 text-sm font-bold text-text">{col.title}</p>
            <ul className="space-y-2 text-sm text-text-muted">
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
      <p className="border-t border-border py-4 text-center text-xs text-text-subtle">
        © {new Intl.DateTimeFormat('fa-IR-u-ca-persian', { year: 'numeric' }).format(new Date())} بانویت. همه حقوق محفوظ است.
      </p>
    </footer>
  );
}
