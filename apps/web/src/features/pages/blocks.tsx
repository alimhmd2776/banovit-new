import Image from 'next/image';
import Link from 'next/link';
import { cx, IconChevronDown } from '@banovit/ui';
import { PageIcon } from './icons';
import { LinkList } from './LinkList';
import type { Block, FeatureItem } from './types';

/**
 * Server renderers for CMS page blocks. Every block is plain HTML first (no JS
 * needed to read anything; accordions are <details>, carousels are scroll-snap
 * rows); only the «برگه بازشو» rows of link_list hydrate (BottomSheet).
 * HTML props arrive sanitized by the CMS (HtmlSanitizer).
 */
export function Blocks({ blocks, inSheet = false }: { blocks: Block[]; inSheet?: boolean }) {
  return (
    <>
      {blocks.map((block) => (
        <BlockView key={block.id} block={block} inSheet={inSheet} />
      ))}
    </>
  );
}

function BlockView({ block, inSheet }: { block: Block; inSheet: boolean }) {
  switch (block.type) {
    case 'rich_text':
      return block.props.html ? <Prose html={block.props.html} className="px-4 lg:px-0" /> : null;
    case 'hero':
      return <Hero {...block.props} />;
    case 'brand_intro':
      return <BrandIntro {...block.props} />;
    case 'section_heading':
      return <SectionHeading {...block.props} />;
    case 'accordion':
      return <AccordionBlock {...block.props} />;
    case 'feature_list':
      return <FeatureList {...block.props} />;
    case 'link_list':
      return inSheet ? null : (
        <LinkList items={block.props.items.map((item) => ({ ...item, sheet: item.sheet_blocks.length ? <Blocks blocks={item.sheet_blocks} inSheet /> : null }))} />
      );
    case 'notice':
      return <Notice {...block.props} />;
    case 'image':
      return <ImageBlock {...block.props} />;
    case 'steps':
      return <Steps items={block.props.items} />;
    case 'buttons':
      return <Buttons items={block.props.items} />;
    case 'team':
      return <Team members={block.props.members} />;
    case 'brand_logos':
      return <BrandLogos items={block.props.items ?? []} />;
    case 'testimonials':
      return <Testimonials items={block.props.items} />;
  }
}

export function Prose({ html, className }: { html: string; className?: string }) {
  return <div className={cx('cms-prose', className)} dangerouslySetInnerHTML={{ __html: html }} />;
}

/**
 * Site logo for page intros: the original live header logo file
 * (uploads/2026/07/Frame-1077.svg, copied to public/brand/logo.svg by the menu
 * thread). Live has no separate «بانویت بار» logo, so both variants use it.
 */
export function Wordmark({ variant = 'banovit', className }: { variant?: 'banovit' | 'banovit-bar'; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static SVG, no optimization needed
    <img
      src="/brand/logo.svg"
      alt={variant === 'banovit-bar' ? 'بانویت بار' : 'بانویت'}
      width={131}
      height={40}
      className={cx('h-9 w-auto', className)}
    />
  );
}

function Hero({ title, highlight, subtitle, image, badge_icon, show_logo }: Extract<Block, { type: 'hero' }>['props']) {
  const parts = highlight && title.includes(highlight) ? title.split(highlight) : null;
  return (
    <section className="relative isolate -mt-px overflow-hidden bg-[var(--brand-900)] text-primary-on lg:mx-0 lg:rounded-lg">
      {image?.url ? (
        <Image src={image.url} alt={image.alt ?? ''} fill priority sizes="(min-width: 1024px) 960px, 100vw" className="-z-10 object-cover opacity-60 grayscale" />
      ) : (
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(120%_80%_at_50%_0%,var(--brand-700),var(--brand-900)_70%)]" aria-hidden="true" />
      )}
      <div className="absolute inset-x-0 bottom-0 -z-10 h-2/3 bg-gradient-to-t from-[var(--neutral-900)] to-transparent" aria-hidden="true" />
      <div className="flex min-h-[260px] flex-col items-center justify-end gap-3 px-6 pb-12 pt-16 text-center lg:min-h-[340px]">
        {show_logo ? (
          // eslint-disable-next-line @next/next/no-img-element -- live site icon (uploads/2026/08/cropped-Asset-1@3x-8.png)
          <img src="/brand/site-icon-192x192.png" alt="" width={48} height={48} className="size-12 rounded-md shadow-md" />
        ) : badge_icon ? (
          <span className="inline-flex size-12 items-center justify-center rounded-md bg-surface text-[var(--color-warning)] shadow-md">
            <PageIcon name={badge_icon} size={26} />
          </span>
        ) : null}
        <p className="text-xl font-extrabold leading-relaxed lg:text-3xl">
          {parts ? (
            <>
              {parts[0]}
              <span className="text-[var(--brand-300)]">{highlight}</span>
              {parts.slice(1).join(highlight ?? '')}
            </>
          ) : (
            title
          )}
        </p>
        {subtitle && <p className="max-w-md text-sm leading-7 text-white/80">{subtitle}</p>}
      </div>
      {/* notch with chevron, like the design */}
      <div className="absolute inset-x-0 bottom-0 flex justify-center" aria-hidden="true">
        <span className="flex h-6 w-14 items-start justify-center rounded-t-full bg-bg pt-1 text-text-muted">
          <IconChevronDown size={16} />
        </span>
      </div>
    </section>
  );
}

function BrandIntro({ logo, title, html }: Extract<Block, { type: 'brand_intro' }>['props']) {
  return (
    <section className="flex flex-col gap-3 px-4 lg:px-0">
      {logo !== 'none' && <Wordmark variant={logo} />}
      <h2 className="text-base font-bold leading-8 text-text lg:text-lg">{title}</h2>
      {html && <Prose html={html} className="text-text-muted" />}
    </section>
  );
}

function SectionHeading({ eyebrow, title, icon, tone, html }: Extract<Block, { type: 'section_heading' }>['props']) {
  return (
    <section className="flex flex-col gap-3 px-4 pt-4 lg:px-0">
      <div className="flex items-center gap-3">
        {icon && (
          <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-text">
            <PageIcon name={icon} size={20} />
          </span>
        )}
        <div className="min-w-0">
          {eyebrow && (
            <p dir="ltr" className={cx('text-end text-xs font-medium', tone === 'danger' ? 'text-danger' : 'text-primary')}>
              {eyebrow}
            </p>
          )}
          <h2 className="text-base font-bold text-text lg:text-lg">{title}</h2>
        </div>
      </div>
      {html && <Prose html={html} className="text-text-muted" />}
    </section>
  );
}

function AccordionBlock({ open_first, items }: Extract<Block, { type: 'accordion' }>['props']) {
  return (
    <section className="mx-4 overflow-hidden rounded-lg border border-border bg-surface-muted lg:mx-0">
      {items.map((item, i) => (
        <details key={i} className="group border-b border-border/70 last:border-b-0" open={open_first && i === 0}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4 text-sm font-bold text-text focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-focus [&::-webkit-details-marker]:hidden lg:text-base">
            <h2>{item.title}</h2>
            <IconChevronDown size={20} className="shrink-0 text-text-subtle transition-transform duration-150 group-open:rotate-180" />
          </summary>
          {item.html && <Prose html={item.html} className="px-4 pb-5 text-text-muted" />}
        </details>
      ))}
    </section>
  );
}

function FeatureList({ style, items, note_html }: Extract<Block, { type: 'feature_list' }>['props']) {
  if (style === 'cards') {
    return (
      <ul className="grid gap-3 px-4 lg:grid-cols-2 lg:px-0">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3 rounded-md border border-border bg-surface p-4">
            <span className="mt-0.5 shrink-0 text-primary">
              <PageIcon name={item.icon} size={26} />
            </span>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-text">{item.title}</h3>
              {item.html && <Prose html={item.html} className="mt-1 text-xs leading-6 text-text-muted" />}
            </div>
          </li>
        ))}
      </ul>
    );
  }
  if (style === 'tiles') {
    return (
      <ul className="mx-4 grid grid-cols-2 divide-x divide-x-reverse divide-border rounded-lg border border-border bg-surface lg:mx-0">
        {items.map((item, i) => (
          <li key={i} className="flex flex-col items-center gap-2 p-4 text-center">
            <span className="inline-flex size-10 items-center justify-center rounded-full bg-surface-muted text-text-muted">
              <PageIcon name={item.icon} size={20} />
            </span>
            <h3 className="text-sm font-bold text-text">{item.title}</h3>
            {item.html && <Prose html={item.html} className="text-xs leading-6 text-text-muted" />}
          </li>
        ))}
      </ul>
    );
  }
  if (style === 'rules') {
    return (
      <ul className="mx-4 flex flex-col gap-5 rounded-lg border border-border bg-surface p-4 lg:mx-0 lg:p-6">
        {items.map((item, i) => (
          <li key={i} className={cx('flex flex-col gap-1', !item.icon && 'border-s-2 border-border ps-3')}>
            <h3 className="flex items-center gap-2 text-sm font-bold text-text">
              {item.icon && (
                <span className="text-primary">
                  <PageIcon name={item.icon} size={20} />
                </span>
              )}
              {item.title}
            </h3>
            {item.html && <Prose html={item.html} className="text-xs leading-6 text-text-muted lg:text-sm lg:leading-7" />}
          </li>
        ))}
      </ul>
    );
  }
  // panel
  return (
    <div className="mx-4 rounded-lg border border-border bg-surface p-4 lg:mx-0 lg:p-6">
      <ul className={cx('flex flex-col divide-y divide-border', items.length > 1 && items.every((x) => x.icon) && 'lg:grid lg:grid-cols-2 lg:gap-6 lg:divide-y-0')}>
        {items.map((item, i) => (
          <PanelItem key={i} item={item} />
        ))}
      </ul>
      {note_html && <Prose html={note_html} className="mt-4 rounded-full bg-primary px-4 py-3 text-center text-xs font-bold text-primary-on [&_strong]:font-extrabold" />}
    </div>
  );
}

function PanelItem({ item }: { item: FeatureItem }) {
  const centered = Boolean(item.icon);
  return (
    <li className={cx('flex flex-col gap-2 py-4 first:pt-0 last:pb-0', centered && 'items-center text-center lg:py-0')}>
      {item.icon && (
        <span className="text-primary">
          <PageIcon name={item.icon} size={30} />
        </span>
      )}
      <h3 className={cx('flex items-center gap-2 text-sm font-bold text-text lg:text-base', centered && 'justify-center')}>
        {item.title}
        {item.badge && <span className="rounded-full bg-primary-subtle px-2 py-0.5 text-[10px] font-medium text-primary-on-subtle">{item.badge}</span>}
      </h3>
      {item.html && <Prose html={item.html} className="text-xs leading-6 text-text-muted lg:text-sm lg:leading-7" />}
    </li>
  );
}

function Notice({ tone, title, html }: Extract<Block, { type: 'notice' }>['props']) {
  if (tone === 'primary') {
    return (
      <aside className="mx-4 overflow-hidden rounded-lg bg-gradient-to-l from-[var(--brand-700)] to-[var(--brand-400)] p-5 text-primary-on lg:mx-0 lg:p-8">
        {title && <p className="text-2xl font-extrabold lg:text-3xl">{title}</p>}
        {html && <Prose html={html} className="mt-2 text-sm leading-7 text-white/90 [&_a]:text-white" />}
      </aside>
    );
  }
  return (
    <aside className={cx('mx-4 rounded-md border p-4 lg:mx-0', tone === 'warning' ? 'border-warning bg-warning-subtle text-warning-on-subtle' : 'border-border bg-surface-muted text-text-muted')}>
      {title && <p className="mb-1 text-sm font-bold text-text">{title}</p>}
      {html && <Prose html={html} className="text-xs leading-6 lg:text-sm lg:leading-7" />}
    </aside>
  );
}

function ImageBlock({ image, caption, href }: Extract<Block, { type: 'image' }>['props']) {
  const img = (
    <Image
      src={image.url}
      alt={image.alt ?? caption ?? ''}
      width={image.width ?? 960}
      height={image.height ?? 540}
      sizes="(min-width: 1024px) 880px, 100vw"
      className="h-auto w-full rounded-lg object-cover"
    />
  );
  return (
    <figure className="px-4 lg:px-0">
      {href ? <Link href={href}>{img}</Link> : img}
      {caption && <figcaption className="mt-2 text-center text-xs text-text-muted">{caption}</figcaption>}
    </figure>
  );
}

function Steps({ items }: { items: Extract<Block, { type: 'steps' }>['props']['items'] }) {
  return (
    <ol className="relative mx-4 flex flex-col gap-8 lg:mx-0">
      <span className="absolute bottom-6 start-[19px] top-6 w-px bg-border" aria-hidden="true" />
      {items.map((step, i) => (
        <li key={i} className="relative flex gap-4">
          <span
            className={cx(
              'z-10 inline-flex size-10 shrink-0 items-center justify-center rounded-full text-base font-bold',
              i < 2 ? 'bg-primary text-primary-on ring-4 ring-primary-subtle' : 'bg-surface-muted text-text',
            )}
            aria-hidden="true"
          >
            {(i + 1).toLocaleString('fa-IR')}
          </span>
          <div className="min-w-0 pt-1">
            <h3 className="flex items-center gap-2 text-sm font-bold text-text">
              {step.icon && (
                <span className="text-primary">
                  <PageIcon name={step.icon} size={18} />
                </span>
              )}
              <span className="sr-only">مرحله {(i + 1).toLocaleString('fa-IR')}: </span>
              {step.title}
            </h3>
            {step.html && <Prose html={step.html} className="mt-1 text-xs leading-6 text-text-muted lg:text-sm lg:leading-7" />}
          </div>
        </li>
      ))}
    </ol>
  );
}

function Buttons({ items }: { items: Extract<Block, { type: 'buttons' }>['props']['items'] }) {
  return (
    <div className="flex flex-col gap-3 px-4 sm:flex-row lg:px-0">
      {items.map((b, i) => (
        <Link
          key={i}
          href={b.href}
          className={cx(
            'inline-flex h-12 w-full items-center justify-center rounded-full text-sm font-bold sm:flex-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
            b.variant === 'primary' ? 'bg-primary text-primary-on hover:bg-primary-hover' : 'bg-surface-muted text-text hover:bg-border',
          )}
        >
          {b.label}
        </Link>
      ))}
    </div>
  );
}

function Rail({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <ul aria-label={label} className="scrollbar-none flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-2 lg:scroll-px-0 lg:px-0">
      {children}
    </ul>
  );
}

function initials(name: string): string {
  return name.split(/\s+/).slice(0, 2).map((w) => w[0]).join('‌');
}

function Team({ members }: { members: Extract<Block, { type: 'team' }>['props']['members'] }) {
  return (
    <Rail label="اعضای تیم">
      {members.map((m, i) => (
        <li key={i} className="flex w-32 shrink-0 snap-start flex-col items-center gap-2 text-center lg:w-40">
          <span className="relative block size-28 overflow-hidden rounded-lg bg-primary lg:size-36">
            {m.photo?.url ? (
              <Image src={m.photo.url} alt={m.photo.alt ?? m.name} fill sizes="160px" className="object-cover" />
            ) : (
              <span className="flex size-full items-center justify-center text-2xl font-bold text-primary-on" aria-hidden="true">
                {initials(m.name)}
              </span>
            )}
          </span>
          <span className="text-sm font-bold text-text">{m.name}</span>
          {m.role && <span className="text-xs text-text-muted">{m.role}</span>}
        </li>
      ))}
    </Rail>
  );
}

function BrandLogos({ items }: { items: NonNullable<Extract<Block, { type: 'brand_logos' }>['props']['items']> }) {
  if (items.length === 0) return null;
  return (
    <Rail label="برندهای همکار">
      {items.map((b) => (
        <li key={b.url} className="shrink-0 snap-start">
          <Link href={b.url} className="flex w-20 flex-col items-center gap-2 text-center focus-visible:outline-2 focus-visible:outline-focus lg:w-24">
            <span className="relative flex size-20 items-center justify-center overflow-hidden rounded-md border border-border bg-surface p-2 lg:size-24">
              {b.logo?.url ? (
                <Image src={b.logo.url} alt={b.logo.alt ?? ''} width={88} height={88} className="size-full object-contain" />
              ) : (
                <span className="text-xs font-bold text-text-muted" aria-hidden="true">
                  {b.name}
                </span>
              )}
            </span>
            <span className="text-xs font-medium text-text">{b.name}</span>
          </Link>
        </li>
      ))}
    </Rail>
  );
}

function Testimonials({ items }: { items: Extract<Block, { type: 'testimonials' }>['props']['items'] }) {
  return (
    <Rail label="نظرات مشتریان">
      {items.map((t, i) => (
        <li key={i} className="w-[85%] shrink-0 snap-start sm:w-[60%] lg:w-[48%]">
          <figure className="flex h-full flex-col gap-3">
            <blockquote className="flex-1 rounded-lg rounded-bl-none bg-surface-muted p-4 text-sm leading-8 text-text">{t.quote}</blockquote>
            <figcaption className="flex items-center gap-3">
              <span className="relative inline-flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-subtle text-sm font-bold text-primary-on-subtle">
                {t.avatar?.url ? <Image src={t.avatar.url} alt="" fill sizes="40px" className="object-cover" /> : <span aria-hidden="true">{initials(t.name)}</span>}
              </span>
              <span className="flex flex-col">
                <span className="text-sm font-bold text-text">{t.name}</span>
                {t.label && <span className="text-xs text-text-muted">{t.label}</span>}
              </span>
            </figcaption>
          </figure>
        </li>
      ))}
    </Rail>
  );
}
