import Image from 'next/image';
import Link from 'next/link';
import type { BlogBlock, BlogNoteBlock, BlogProductsBlock, ProductCard as ProductCardData } from '@banovit/api-client';
import { faDigits, formatToman, IconAward, IconBulb, IconChevronLeft, ProductCard } from '@banovit/ui';
import { localizeLinks } from './format';

/** Renders the CMS blocks in order: sanitized HTML, product cards/carousels, notes. */
export function PostBlocks({ blocks }: { blocks: BlogBlock[] }) {
  return (
    <>
      {blocks.map((b, i) => {
        if (b.type === 'html') return <div key={i} className="blog-prose" dangerouslySetInnerHTML={{ __html: localizeLinks(b.html) }} />;
        if (b.type === 'products') return <ProductsBlock key={i} block={b as BlogProductsBlock} />;
        if (b.type === 'note') return <NoteBlock key={i} block={b as BlogNoteBlock} />;
        return null;
      })}
    </>
  );
}

export function NoteBlock({ block }: { block: BlogNoteBlock }) {
  const { title = 'نکته مهم!', html = '' } = block.props;
  return (
    <aside className="my-6 rounded-md border-s-4 border-primary bg-surface p-4 shadow-xs ring-1 ring-border">
      <p className="mb-2 flex items-center gap-2 text-sm font-bold text-text">
        <span className="flex size-7 items-center justify-center rounded-full bg-primary-subtle text-primary">
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
export function InlineProductCard({ product }: { product: ProductCardData }) {
  return (
    <article className="my-6 rounded-lg border border-border bg-surface p-4 shadow-xs">
      <div className="flex gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <span className="inline-block rounded-full bg-primary-subtle px-2 py-0.5 text-[11px] font-medium text-primary-on-subtle">محصول پیشنهادی</span>
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
          اطلاعات بیشتر
          <IconChevronLeft size={16} />
        </Link>
      </div>
    </article>
  );
}

/** «پرفروش‌ترین ...» carousel on the blue panel (several products). */
export function ProductCarousel({ title, subtitle, products }: { title?: string | null; subtitle?: string | null; products: ProductCardData[] }) {
  return (
    <section className="my-8 -mx-4 bg-primary px-4 py-5 sm:mx-0 sm:rounded-lg sm:px-5" aria-label={title ?? 'محصولات پیشنهادی'}>
      <div className="mb-4 flex items-center gap-3 text-primary-on">
        <span className="flex size-10 items-center justify-center rounded-full border border-white/40">
          <IconAward size={20} />
        </span>
        <div>
          <p className="text-base font-bold">{title ?? 'محصولات پیشنهادی'}</p>
          {subtitle ? <p className="text-xs opacity-80">{subtitle}</p> : null}
        </div>
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
  const { products, layout, title, subtitle } = block.props;
  if (products.length === 0) return null;
  if (layout === 'card' && products[0]) return <InlineProductCard product={products[0]} />;
  return <ProductCarousel title={title} subtitle={subtitle} products={products} />;
}

/** «خلاصه مقاله» box under the intro. */
export function SummaryBox({ html }: { html: string }) {
  return (
    <section aria-labelledby="post-summary" className="rounded-lg bg-surface-muted p-4">
      <h2 id="post-summary" className="mb-2 text-base font-bold text-text-muted">
        خلاصه مقاله
      </h2>
      <div className="blog-prose text-sm leading-7 [&_p]:text-text" dangerouslySetInnerHTML={{ __html: localizeLinks(html) }} />
    </section>
  );
}
