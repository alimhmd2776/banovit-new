import Image from 'next/image';
import Link from 'next/link';
import type { MyReview } from '@banovit/api-client';
import { cx, faDigits, IconCheckCircle, IconChevronLeft, IconStar } from '@banovit/ui';
import { jalaliLong } from './format';

const RATING_LABEL = ['', 'ضعیف', 'متوسط', 'خوب', 'خیلی خوب', 'عالی'];

/** «دیدگاه های من» card (design 15). */
export function ReviewCard({ review: r, name }: { review: MyReview; name: string }) {
  return (
    <article className="rounded-md border border-border p-3">
      <header className="flex items-center gap-3">
        <span className="inline-flex size-11 items-center justify-center rounded-full bg-primary-subtle text-lg font-extrabold text-primary" aria-hidden="true">{(r.author_name || name).trim().charAt(0)}</span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 font-bold text-text">
            {r.author_name || name}
            {r.is_verified_buyer ? <span className="rounded-full border border-primary px-2 text-[10px] leading-4 text-primary">خریدار</span> : null}
          </p>
          {r.is_verified_buyer ? <p className="mt-0.5 flex items-center gap-1 text-[11px] text-primary"><IconCheckCircle size={12} /> خریدار فعال و باتجربه بانویت</p> : null}
        </div>
        {r.status === 'pending' ? <span className="rounded-full bg-warning-subtle px-2 text-[11px] leading-5 text-warning-on-subtle">در انتظار تایید</span> : null}
      </header>
      {r.rating ? (
        <p className="mt-3 flex items-center gap-2">
          <span className="flex" aria-label={`${faDigits(r.rating)} از ۵`}>
            {[1, 2, 3, 4, 5].map((n) => <IconStar key={n} size={18} className={n <= r.rating! ? 'text-rating' : 'text-border'} />)}
          </span>
          <span className="rounded-full bg-success-subtle px-2 text-[11px] leading-5 text-success-on-subtle">{RATING_LABEL[r.rating]}</span>
        </p>
      ) : null}
      {r.body ? (
        <details className="group mt-2">
          <summary className="cursor-pointer list-none text-xs leading-6 text-text-muted [&::-webkit-details-marker]:hidden">
            <span className="line-clamp-3 group-open:line-clamp-none">{r.body}</span>
            <span className="mt-1 flex justify-between">
              <span className="text-text-subtle">{jalaliLong(r.created_at)}</span>
              <span className="font-bold text-primary underline group-open:hidden">مشاهده بیشتر</span>
            </span>
          </summary>
        </details>
      ) : (
        <p className="mt-2 text-xs text-text-subtle">{jalaliLong(r.created_at)}</p>
      )}
      {r.product ? (
        <Link href={r.product.path} className="mt-3 flex items-center gap-3 border-t border-border pt-3">
          <span className="relative size-11 overflow-hidden rounded-sm bg-surface-muted">
            {r.product.image ? <Image src={r.product.image.url} alt="" fill sizes="44px" className="object-cover" /> : null}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-bold text-text">{r.product.name}</span>
            {r.product.sizes ? <span className={cx('block text-[11px] text-text-muted')}>{(r.product.sizes as { label?: string }).label}</span> : null}
          </span>
          <IconChevronLeft size={18} className="text-text-muted" />
        </Link>
      ) : null}
    </article>
  );
}
