import Image from 'next/image';
import Link from 'next/link';
import type { BlogArticleBlock, BlogBlock, BlogMapBlock, BlogNoteBlock, BlogProductsBlock, BlogQuizBlock, BlogStatBlock, ProductCard as ProductCardData } from '@banovit/api-client';
import { cx, faDigits, formatToman, IconArticle, IconAward, IconBulb, IconChevronLeft, IconEye, IconHistory, IconMapPin, ProductCard } from '@banovit/ui';
import { MapPreview } from '../account/MapPreview';
import { faAgo, internalHref, localizeLinks } from './format';
import { QuizBlock } from './QuizBlock';

/** Renders the CMS blocks in order: sanitized HTML, product cards/carousels, notes, suggested posts, quizzes, maps. */
type BlockLabels = { map: { label: string; link: string }; stat: { views: string; updated: string } };

export function PostBlocks({ blocks, labels }: { blocks: BlogBlock[]; labels: BlockLabels }) {
  return (
    <>
      {blocks.map((b, i) => {
        if (b.type === 'html') return <div key={i} className="blog-prose" dangerouslySetInnerHTML={{ __html: localizeLinks(b.html) }} />;
        if (b.type === 'products') return <ProductsBlock key={i} block={b as BlogProductsBlock} />;
        if (b.type === 'note') return <NoteBlock key={i} block={b as BlogNoteBlock} />;
        if (b.type === 'article') return <ArticleBlock key={i} block={b as BlogArticleBlock} />;
        if (b.type === 'quiz') return <QuizBlock key={i} block={b as BlogQuizBlock} />;
        if (b.type === 'map') return <MapBlock key={i} block={b as BlogMapBlock} labels={labels.map} />;
        if (b.type === 'stat') return <StatBlock key={i} block={b as BlogStatBlock} labels={labels.stat} />;
        return null;
      })}
    </>
  );
}

const NOTE_THEMES = {
  blue: { border: 'border-primary', icon: 'bg-primary-subtle text-primary' },
  red: { border: 'border-danger', icon: 'bg-danger-subtle text-danger' },
  green: { border: 'border-success', icon: 'bg-success-subtle text-success' },
  orange: { border: 'border-warning', icon: 'bg-warning-subtle text-warning' },
} as const;

export function NoteBlock({ block }: { block: BlogNoteBlock }) {
  const { title = 'نکته مهم!', html = '', theme } = block.props;
  const t = NOTE_THEMES[theme ?? 'blue'] ?? NOTE_THEMES.blue;
  return (
    <aside className={cx('my-6 rounded-md border-s-4 bg-surface p-4 shadow-xs ring-1 ring-border', t.border)}>
      <p className="mb-2 flex items-center gap-2 text-sm font-bold text-text">
        <span className={cx('flex size-7 items-center justify-center rounded-full', t.icon)}>
          <IconBulb size={16} />
        </span>
        {title}
      </p>
      <div className="blog-prose text-sm leading-7" dangerouslySetInnerHTML={{ __html: localizeLinks(html) }} />
    </aside>
  );
}

function PriceLine({ product }: { product: ProductCardData }) {
  if (!product.in_stock || !product.price) return <p className="text-sm text-text-subtle">ناموجود</p>;
  return (
    <div className="space-y-1">
      {product.discount_percent > 0 && product.regular_price ? (
        <p className="flex items-center gap-2">
          <span className="rounded-full bg-danger px-2 text-xs font-bold leading-5 text-white">٪{faDigits(product.discount_percent)}</span>
          <del className="text-xs text-text-subtle">{formatToman(product.regular_price.amount)}</del>
        </p>
      ) : null}
      <p className="text-base font-extrabold text-text">
        {formatToman(product.price.amount)} <span className="text-xs font-medium">تومان</span>
      </p>
    </div>
  );
}

/** Inline «محصول پیشنهادی» card (single product inside the article). */
export function InlineProductCard({ product, badge, button }: { product: ProductCardData; badge?: string | null; button?: string | null }) {
  return (
    <article className="my-6 rounded-lg border border-border bg-surface p-4 shadow-xs">
      <div className="flex gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <span className="inline-block rounded-full bg-primary-subtle px-2 py-0.5 text-[11px] font-medium text-primary-on-subtle">{badge || 'محصول پیشنهادی'}</span>
          <h3 className="line-clamp-2 text-base font-bold leading-7 text-text">{product.name}</h3>
        </div>
        <div className="relative size-20 shrink-0">
          {product.image ? <Image src={product.image.url} alt={product.image.alt ?? product.name} fill sizes="80px" className="object-contain" /> : null}
        </div>
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <PriceLine product={product} />
        <Link
          href={product.path}
          className="inline-flex h-11 items-center gap-1 rounded-full bg-surface-muted px-4 text-sm font-medium text-text hover:bg-primary-subtle hover:text-primary focus-visible:outline-2 focus-visible:outline-focus"
        >
          {button || 'اطلاعات بیشتر'}
          <IconChevronLeft size={16} />
        </Link>
      </div>
    </article>
  );
}

/** «پرفروش‌ترین ...» carousel on the blue panel (several products). */
export function ProductCarousel({
  title,
  subtitle,
  products,
  button,
  buttonUrl,
}: {
  title?: string | null;
  subtitle?: string | null;
  products: ProductCardData[];
  button?: string | null;
  buttonUrl?: string | null;
}) {
  return (
    <section className="my-8 -mx-4 bg-primary px-4 py-5 sm:mx-0 sm:rounded-lg sm:px-5" aria-label={title ?? 'محصولات پیشنهادی'}>
      <div className="mb-4 flex items-center gap-3 text-primary-on">
        <span className="flex size-10 items-center justify-center rounded-full border border-white/40">
          <IconAward size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-base font-bold">{title ?? 'محصولات پیشنهادی'}</p>
          {subtitle ? <p className="text-xs opacity-80">{subtitle}</p> : null}
        </div>
        {button && buttonUrl ? (
          <Link
            href={internalHref(buttonUrl)}
            className="inline-flex h-11 shrink-0 items-center gap-1 rounded-full border border-white/40 px-3 text-xs font-medium hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white"
          >
            {button}
            <IconChevronLeft size={14} />
          </Link>
        ) : null}
      </div>
      <ul className="scrollbar-none -mx-4 flex snap-x gap-3 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {products.map((p) => (
          <li key={p.id} className="w-[46%] shrink-0 snap-start sm:w-[30%] lg:w-[23%]">
            <ProductCard product={p} sizes="(min-width: 1024px) 200px, 46vw" />
          </li>
        ))}
      </ul>
    </section>
  );
}

function ProductsBlock({ block }: { block: BlogProductsBlock }) {
  const { products, layout, title, subtitle, badge, button, button_url } = block.props;
  if (products.length === 0) return null;
  if (layout === 'card' && products[0]) return <InlineProductCard product={products[0]} badge={badge} button={button} />;
  return <ProductCarousel title={title} subtitle={subtitle} products={products} button={button} buttonUrl={button_url} />;
}

/** «مقاله پیشنهادی» card linking another post. */
export function ArticleBlock({ block }: { block: BlogArticleBlock }) {
  const { label, button, post } = block.props;
  return (
    <aside className="my-6 flex gap-3 rounded-lg border border-border bg-surface p-3 shadow-xs sm:p-4">
      {post.cover ? (
        <div className="relative aspect-[4/3] w-28 shrink-0 overflow-hidden rounded-md bg-surface-muted sm:w-40">
          <Image src={post.cover.url} alt={post.cover.alt ?? post.title} fill sizes="(min-width: 640px) 160px, 112px" className="object-cover" />
        </div>
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span className="inline-flex w-fit items-center gap-1 rounded-full bg-primary-subtle px-2 py-0.5 text-[11px] font-medium text-primary-on-subtle">
          <IconArticle size={12} />
          {label}
        </span>
        <p className="line-clamp-2 text-sm font-bold leading-6 text-text sm:text-base sm:leading-7">{post.title}</p>
        {post.excerpt ? <p className="line-clamp-2 hidden text-xs leading-6 text-text-muted sm:block">{post.excerpt}</p> : null}
        <Link
          href={post.url}
          className="mt-auto inline-flex h-11 w-fit items-center gap-1 rounded-full text-sm font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-focus"
        >
          {button}
          <IconChevronLeft size={16} />
        </Link>
      </div>
    </aside>
  );
}

/** Location map from the old site's map widget: static tiles + a link to the full map. */
export function MapBlock({ block, labels }: { block: BlogMapBlock; labels: BlockLabels['map'] }) {
  const { lat, lng, label } = block.props;
  return (
    <figure className="my-6">
      <MapPreview lat={lat} lng={lng} className="h-56 w-full sm:h-72" />
      <figcaption className="mt-2 flex items-center justify-between gap-2 text-sm text-text-muted">
        <span className="flex items-center gap-1">
          <IconMapPin size={16} />
          {label || labels.label}
        </span>
        <a
          href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`}
          target="_blank"
          rel="noopener nofollow"
          className="inline-flex h-11 items-center text-primary hover:underline"
        >
          {labels.link}
        </a>
      </figcaption>
    </figure>
  );
}

/** «خلاصه مقاله» box under the intro. */
export function SummaryBox({ html, title = 'خلاصه مقاله' }: { html: string; title?: string }) {
  return (
    <section aria-labelledby="post-summary" className="rounded-lg bg-surface-muted p-4">
      <h2 id="post-summary" className="mb-2 text-base font-bold text-text-muted">
        {title}
      </h2>
      <div className="blog-prose text-sm leading-7 [&_p]:text-text" dangerouslySetInnerHTML={{ __html: localizeLinks(html) }} />
    </section>
  );
}

/** [post-views] / [last_update] placed by the author: live view count or «… پیش». */
export function StatBlock({ block, labels }: { block: BlogStatBlock; labels: BlockLabels['stat'] }) {
  const { kind, value } = block.props;
  return (
    <p className="my-2 inline-flex items-center gap-1 rounded-full bg-surface-muted px-3 py-1 text-xs text-text-muted">
      {kind === 'views' ? <IconEye size={14} /> : <IconHistory size={14} />}
      {kind === 'views' ? (
        <>
          {labels.views} {faDigits(Number(value) || 0)}
        </>
      ) : (
        <>
          {labels.updated} <time dateTime={value}>{faAgo(value)}</time>
        </>
      )}
    </p>
  );
}
