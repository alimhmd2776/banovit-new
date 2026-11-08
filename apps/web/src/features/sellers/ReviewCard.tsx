import Image from 'next/image';
import Link from 'next/link';
import type { SellerReview } from '@banovit/api-client';
import { cx, IconChevronLeft, IconStar, IconUser, IconVerified } from '@banovit/ui';
import { ExpandableText } from './ExpandableText';

const RATING_LABEL: Record<number, string> = { 5: 'عالی', 4: 'خوب', 3: 'متوسط', 2: 'ضعیف', 1: 'خیلی ضعیف' };

const persianDate = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Tehran' });

export function ReviewCard({ review }: { review: SellerReview }) {
  const { author, product } = review;
  return (
    <article className="rounded-lg border border-border bg-surface p-4">
      <header className="flex items-start gap-3">
        <span className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-subtle text-primary">
          {author.avatar ? <Image src={author.avatar.url} alt="" fill sizes="48px" className="object-cover" /> : <IconUser size={24} />}
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-bold text-text">{author.name}</h3>
            {author.is_buyer ? <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[11px] text-text-muted">خریدار</span> : null}
          </div>
          {author.is_experienced_buyer ? (
            <p className="flex items-center gap-1 text-xs text-primary">
              <IconVerified size={16} />
              خریدار فعال و باتجربه بانویت
            </p>
          ) : null}
        </div>
      </header>

      <div className="mt-3 flex items-center gap-2">
        <span className="flex gap-0.5" role="img" aria-label={`امتیاز ${review.rating} از ۵`}>
          {[1, 2, 3, 4, 5].map((i) => (
            <IconStar key={i} size={20} className={cx(i <= review.rating ? 'text-rating' : 'text-border')} />
          ))}
        </span>
        <span className="rounded-full bg-success-subtle px-2 py-0.5 text-xs text-success-on-subtle">{RATING_LABEL[review.rating]}</span>
      </div>

      <div className="mt-3">
        <ExpandableText text={review.body} />
      </div>
      <p className="mt-2 text-end text-xs text-text-subtle">
        <time dateTime={review.created_at}>{persianDate.format(new Date(review.created_at))}</time>
      </p>

      {product ? (
        <Link href={product.path} className="mt-3 flex items-center gap-3 border-t border-border pt-3 hover:text-primary">
          <span className="relative size-12 shrink-0 overflow-hidden rounded-sm bg-surface-muted">
            {product.image ? <Image src={product.image.url} alt={product.image.alt ?? product.name} fill sizes="48px" className="object-cover" /> : null}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-text">{product.name}</span>
            {product.variant_label ? <span className="block truncate text-xs text-text-muted">{product.variant_label}</span> : null}
          </span>
          <IconChevronLeft size={20} className="shrink-0 text-text-muted" />
        </Link>
      ) : null}
    </article>
  );
}

export function ReviewsEmpty({ sellerName }: { sellerName: string }) {
  return (
    <div className="flex flex-col items-center rounded-md border border-dashed border-border-strong bg-surface px-6 py-12 text-center">
      <span className="mb-4 flex size-16 items-center justify-center rounded-full bg-surface-muted text-rating">
        <IconStar size={32} />
      </span>
      <h2 className="text-base font-bold text-text">هنوز نظری ثبت نشده است</h2>
      <p className="mt-2 max-w-sm text-sm leading-7 text-text-muted">
        بعد از خرید از {sellerName} می‌توانید از بخش «سفارش‌های من» به فروشگاه امتیاز بدهید و تجربه‌تان را با دیگران به اشتراک بگذارید.
      </p>
    </div>
  );
}
