import Link from 'next/link';
import type { ProductDetail } from '@banovit/api-client';
import {
  Accordion,
  Breadcrumb,
  cx,
  faDigits,
  IconChevronLeft,
  IconCreditCard,
  IconGift,
  IconShield,
  IconStar,
  IconTruck,
  ProductCard,
} from '@banovit/ui';
import { SupportCallout } from '@/features/plp/SupportCallout';
import { jsonLdScript, productJsonLd, type Crumb } from '@/lib/seo';
import { siteConfig } from '@/lib/site-config';
import { ExpandableHtml } from './Expandable';
import { Gallery } from './Gallery';
import { PurchaseProvider, type PurchaseProduct } from './PurchaseContext';
import { AddonPickers, BuyBox, InstallCard, MobileBuyBar, OptionPickers } from './PurchaseControls';
import { MadeToOrderBox, VanityCalculator } from './VanityCalculator';
import { SellerPanel } from './SellerPanel';
import { VideoStrip } from './VideoStrip';
import { MoreReviews, WriteReview } from './ReviewActions';
import { ReviewCard } from './ReviewCard';
import { SectionTabs, type SectionTab } from './SectionTabs';
import { ShareButton } from './ShareButton';

const SHIPPING_ICONS = { truck: IconTruck, card: IconCreditCard, gift: IconGift } as const;

function Section({ id, title, children, action, className }: { id?: string; title: string; children: React.ReactNode; action?: React.ReactNode; className?: string }) {
  return (
    <section id={id} aria-labelledby={id ? `${id}-title` : undefined} className={cx('scroll-mt-32 space-y-4 border-t-8 border-bg py-6 lg:rounded-lg lg:border lg:border-border lg:bg-surface lg:p-6', className)}>
      <div className="flex items-center justify-between gap-3">
        <h2 id={id ? `${id}-title` : undefined} className="text-base font-bold text-text lg:text-lg">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

/**
 * Product page body. Mobile follows designs/pdp/01-pdp-mobile.jpg (gallery,
 * info sheet, pickers, seller box, sections, sticky buy bar). From lg the top
 * becomes gallery | info | buy box, and the sections run in a main column.
 * Everything shown on mobile is in the desktop HTML too (SEO parity).
 */
export function PdpView({ product: p }: { product: ProductDetail }) {
  const crumbs: Crumb[] = [{ name: 'بانویت', url: '/' }, ...p.breadcrumb.map((b) => ({ name: b.name, url: b.url })), { name: p.name, url: p.path }];
  const visibleCrumbs = [
    ...(p.brand ? [{ name: `برند ${p.brand.name}`, url: p.brand.url }] : []),
    ...(p.primary_category ? [{ name: p.primary_category.name, url: p.primary_category.url }] : []),
  ];
  const highlights = p.specs.slice(0, 6);

  const purchase: PurchaseProduct = {
    id: p.id,
    slug: p.slug,
    name: p.name,
    path: p.path,
    brand: p.brand?.name ?? null,
    category: p.primary_category?.name ?? null,
    type: p.type,
    price: p.price,
    price_max: p.price_max,
    regular_price: p.regular_price,
    discount_percent: p.discount_percent,
    in_stock: p.in_stock,
    options: p.options,
    variants: p.variants,
    addons: p.addons,
    made_to_order: p.made_to_order,
    consult_phone: p.consult_phone,
    offers: p.offers,
    default_selection: p.default_selection,
  };

  const tabs: SectionTab[] = [
    { id: 'specs', label: 'مشخصات' },
    ...(p.description_html ? [{ id: 'review', label: 'بررسی تخصصی' }] : []),
    { id: 'reviews', label: 'دیدگاه کاربران' },
    ...(p.related.length ? [{ id: 'related', label: 'پیشنهاد ما' }] : []),
  ];

  return (
    <PurchaseProvider product={purchase}>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(productJsonLd(p, crumbs))} />

      <div className="mx-auto max-w-container px-4 pb-28 pt-3 lg:pb-12 lg:pt-6">
        <div className="lg:hidden">
          <SectionTabs tabs={tabs} />
        </div>

        {/* ---------- top: gallery | info | buy box ---------- */}
        <div className="grid grid-cols-[minmax(0,1fr)] gap-4 pt-3 lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)_300px] lg:items-start lg:gap-8 lg:pt-0">
          <div className="min-w-0 lg:sticky lg:top-[calc(var(--header-height)+56px)]">
            <Gallery images={p.images} name={p.name} />
            {p.videos.length ? <VideoStrip videos={p.videos} name={p.name} /> : null}
          </div>

          <div className="-mx-4 space-y-5 rounded-t-[28px] bg-surface px-4 pt-5 shadow-[0_-8px_24px_rgb(18_22_28/0.06)] lg:mx-0 lg:rounded-none lg:bg-transparent lg:p-0 lg:shadow-none">
            <span className="mx-auto -mt-2 mb-1 block h-1 w-10 rounded-full bg-border lg:hidden" aria-hidden />
            <div className="flex items-center justify-between gap-2">
              <Breadcrumb items={visibleCrumbs} className="min-w-0 flex-1" />
              <ShareButton title={p.name} path={p.path} />
            </div>
            {/* Full breadcrumb for crawlers and screen readers: matches the BreadcrumbList JSON-LD. */}
            <Breadcrumb items={crumbs} className="sr-only" />

            <h1 className="text-lg font-extrabold leading-8 text-text lg:text-2xl lg:leading-10">{p.name}</h1>

            <ul className="flex flex-wrap items-center gap-2 text-xs">
              {p.label ? (
                <li>
                  <span className="inline-flex h-8 items-center rounded-full bg-primary-subtle px-3 font-bold text-primary">{p.label}</span>
                </li>
              ) : null}
              {p.rating ? (
                <li className="inline-flex items-center gap-1 px-1 text-text">
                  <IconStar size={16} className="fill-[var(--color-rating)] text-rating" aria-hidden />
                  <span className="font-bold">{faDigits(p.rating.average)}</span>
                  <span className="text-text-subtle">({faDigits(p.rating.count)})</span>
                </li>
              ) : null}
              <li>
                <a href="#reviews" className="inline-flex h-8 items-center gap-1 rounded-full bg-surface-muted px-3 text-text-muted hover:text-primary">
                  {p.reviews.total ? `${faDigits(p.reviews.total)} دیدگاه` : 'ثبت اولین دیدگاه'}
                  <IconChevronLeft size={14} />
                </a>
              </li>
              {p.specs.length ? (
                <li>
                  <a href="#specs" className="inline-flex h-8 items-center gap-1 rounded-full bg-surface-muted px-3 text-text-muted hover:text-primary">
                    مشخصات فنی
                    <IconChevronLeft size={14} />
                  </a>
                </li>
              ) : null}
            </ul>

            <InstallCard installBadge={p.badges.install_service} />

            {p.made_to_order || p.calculator ? (
              <MadeToOrderBox note={p.availability_note} phone={p.consult_phone} hasCalculator={!!p.calculator} />
            ) : p.availability_note ? (
              <div className="prose-pdp rounded-md bg-surface-muted p-3 text-xs leading-6 text-text-muted" dangerouslySetInnerHTML={{ __html: p.availability_note }} />
            ) : null}

            {p.options.length ? (
              <div className="border-t border-border pt-5">
                <OptionPickers />
              </div>
            ) : null}

            {p.addons.some((a) => !a.options.some((o) => o.kind === 'installation')) && !p.made_to_order ? (
              <div className="border-t border-border pt-5">
                <AddonPickers />
              </div>
            ) : null}

            {p.calculator ? <VanityCalculator calc={p.calculator} productName={p.name} consultPhone={p.consult_phone} /> : null}

            {highlights.length ? (
              <div className="space-y-3 border-t border-border pt-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-[15px] font-bold text-text">مشخصات فنی کالا</h2>
                  <a href="#specs" className="text-sm font-medium text-primary">
                    مشاهده همه
                  </a>
                </div>
                <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none lg:mx-0 lg:grid lg:grid-cols-2 lg:px-0">
                  {highlights.map((s) => (
                    <li key={s.label} className="w-36 shrink-0 rounded-md border border-border bg-surface p-3 lg:w-auto">
                      <p className="truncate text-[11px] text-text-subtle">{s.label}</p>
                      <p className="mt-1 line-clamp-2 text-[13px] font-medium leading-5 text-text">{s.value}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {p.short_description_html && !p.key_features.length ? (
              <div className="prose-pdp border-t border-border pt-5 text-sm leading-7 text-text-muted" dangerouslySetInnerHTML={{ __html: p.short_description_html }} />
            ) : null}
          </div>

          {/* seller + desktop buy box */}
          <aside aria-label="خرید" className="space-y-4 lg:sticky lg:top-[calc(var(--header-height)+56px)]">
            <div className="hidden lg:block">
              <BuyBox />
            </div>
            <SellerBox seller={p.seller} shippingHtml={p.shipping_html} />
          </aside>
        </div>

        <div className="mt-2 lg:mt-10 lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-8">
          <div className="space-y-0 lg:space-y-6">
            <div className="hidden lg:block">
              <SectionTabs tabs={tabs} />
            </div>

            {p.description_html ? (
              <Section id="review" title="معرفی محصول">
                <ExpandableHtml html={p.description_html} />
              </Section>
            ) : null}

            <Section id="specs" title="مشخصات فنی محصول">
              {p.specs.length ? (
                <table className="w-full overflow-hidden rounded-md text-sm">
                  <caption className="sr-only">مشخصات فنی {p.name}</caption>
                  <tbody>
                    {p.specs.map((s) => (
                      <tr key={s.label} className="border-b border-border last:border-0">
                        <th scope="row" className="w-[34%] bg-surface-muted px-4 py-4 text-start align-top text-[13px] font-normal text-text-muted">
                          {s.label}
                        </th>
                        <td className="px-4 py-4 text-[13px] font-medium leading-6 text-text">{s.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-sm text-text-muted">مشخصات این محصول به‌زودی تکمیل می‌شود.</p>
              )}
              {p.sku ? <p className="text-xs text-text-subtle">کد کالا: {p.sku}</p> : null}
            </Section>

            {p.key_features.length ? (
              <Section title="ویژگی‌های کلیدی">
                <ul className="list-disc space-y-1.5 ps-5 text-sm leading-7 text-text-muted marker:text-text-subtle">
                  {p.key_features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </Section>
            ) : null}

            <Section id="reviews" title="دیدگاه کاربران">
              <div className="flex items-center gap-3">
                <span className="flex size-12 items-center justify-center rounded-full border border-border">
                  <IconStar size={24} className="fill-[var(--color-rating)] text-rating" aria-hidden />
                </span>
                {p.rating ? (
                  <div>
                    <p className="text-lg font-extrabold text-text">
                      {faDigits(p.rating.average)} <span className="text-sm font-normal text-text-subtle">/ ۵</span>
                    </p>
                    <p className="text-xs text-text-muted">{faDigits(p.rating.count)} امتیاز ثبت شده</p>
                  </div>
                ) : (
                  <p className="text-sm text-text-muted">هنوز امتیازی ثبت نشده است.</p>
                )}
                {p.rating ? (
                  <div className="ms-auto hidden w-48 space-y-1 sm:block" aria-label="توزیع امتیازها">
                    {(['5', '4', '3', '2', '1'] as const).map((k) => {
                      const n = p.rating!.distribution[k] ?? 0;
                      return (
                        <div key={k} className="flex items-center gap-2 text-[11px] text-text-subtle">
                          <span className="w-3">{faDigits(Number(k))}</span>
                          <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-muted">
                            <span className="block h-full rounded-full bg-rating" style={{ width: `${p.rating!.count ? (100 * n) / p.rating!.count : 0}%` }} />
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>

              {p.reviews.items.length ? (
                <ul className="space-y-3">
                  {p.reviews.items.map((r) => (
                    <li key={r.id}>
                      <ReviewCard review={r} />
                    </li>
                  ))}
                </ul>
              ) : null}
              <MoreReviews slug={p.slug} shownIds={p.reviews.items.map((r) => r.id)} total={p.reviews.total} />
              <WriteReview slug={p.slug} productName={p.name} />
            </Section>

            {p.related.length ? (
              <Section id="related" title="محصولات مرتبط" action={p.primary_category ? <MoreLink href={p.primary_category.url} /> : null}>
                <ul className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 scrollbar-none lg:mx-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0 xl:grid-cols-4">
                  {p.related.map((r) => (
                    <li key={r.id} className="w-[46%] shrink-0 snap-start sm:w-[31%] lg:w-auto">
                      <ProductCard product={r} sizes="(min-width: 1024px) 220px, 46vw" />
                    </li>
                  ))}
                </ul>
              </Section>
            ) : null}

            {p.related_posts.length ? (
              <Section title="بلاگ‌های مفید برای شما" action={<MoreLink href="/blog/" />}>
                <ul className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 scrollbar-none lg:mx-0 lg:grid lg:grid-cols-3 lg:px-0">
                  {p.related_posts.map((post) => (
                    <li key={post.url} className="w-[70%] shrink-0 snap-start lg:w-auto">
                      <Link href={post.url} className="block space-y-2">
                        {post.image ? <img src={post.image.url} alt={post.image.alt ?? ''} className="aspect-video w-full rounded-md object-cover" loading="lazy" /> : null}
                        {post.category ? <p className="text-xs text-primary">{post.category}</p> : null}
                        <p className="text-sm font-bold leading-6 text-text">{post.title}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </Section>
            ) : null}

            {p.faqs.length ? (
              <Section title="سوالات متداول">
                <Accordion items={p.faqs.map((f) => ({ id: f.id, title: f.question, html: f.answer_html }))} />
              </Section>
            ) : null}

            <div className="border-t-8 border-bg pt-6 lg:border-0 lg:pt-0">
              <SupportCallout
                phone={siteConfig.supportPhone}
                phoneDisplay={siteConfig.supportPhoneDisplay}
                pageTitle={p.name}
              />
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="sticky top-[calc(var(--header-height)+16px)]">
              <BuyBox />
            </div>
          </div>
        </div>
      </div>

      <MobileBuyBar />
    </PurchaseProvider>
  );
}

function MoreLink({ href }: { href: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1 text-sm font-medium text-primary">
      بیشتر
      <IconChevronLeft size={16} />
    </Link>
  );
}

function SellerBox({ seller, shippingHtml }: { seller: ProductDetail['seller']; shippingHtml: string | null }) {
  return (
    <section aria-labelledby="seller-title" className="space-y-4 border-t-8 border-bg pt-5 lg:rounded-lg lg:border lg:border-border lg:bg-surface lg:p-5">
      <SellerPanel />
      <div className="flex items-start gap-3 border-t border-border pt-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-muted text-text-muted">
          <IconShield size={20} />
        </span>
        <p className="pt-2 text-sm font-medium text-text">{seller.warranty}</p>
      </div>
      <div className="flex items-start gap-3 border-t border-border pt-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-muted text-text-muted">
          <IconTruck size={20} />
        </span>
        <div className="flex-1 space-y-2">
          <Link href={seller.shipping.url} className="flex items-center justify-between pt-2 text-sm font-bold text-text hover:text-primary">
            {seller.shipping.title}
            <IconChevronLeft size={16} className="text-text-subtle" />
          </Link>
          <ul className="space-y-1.5">
            {seller.shipping.lines.map((l) => {
              const Icon = SHIPPING_ICONS[l.icon as keyof typeof SHIPPING_ICONS] ?? IconTruck;
              return (
                <li key={l.label} className="flex items-start gap-1.5 text-xs leading-5 text-text-muted">
                  <Icon size={14} className="mt-0.5 shrink-0 text-primary" />
                  <span>
                    <span className="text-text-subtle">{l.label}:</span> {l.text}
                  </span>
                </li>
              );
            })}
          </ul>
          {shippingHtml ? (
            <div className="prose-pdp border-t border-border pt-2 text-xs leading-6 text-text-muted" dangerouslySetInnerHTML={{ __html: shippingHtml }} />
          ) : null}
        </div>
      </div>
    </section>
  );
}
