import type { Review } from '@banovit/api-client';
import { cx, faDigits, IconCheck, IconStar, IconThumbDown, IconThumbUp } from '@banovit/ui';

const LABELS = ['', 'خیلی بد', 'بد', 'معمولی', 'خوب', 'عالی'];

export function Stars({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`امتیاز ${faDigits(value)} از ۵`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <IconStar key={n} size={size} aria-hidden className={cx(n <= Math.round(value) ? 'fill-[var(--color-rating)] text-rating' : 'text-border-strong')} />
      ))}
    </span>
  );
}

function faDate(iso: string | null): string | null {
  if (!iso) return null;
  try {
    return new Intl.DateTimeFormat('fa-IR-u-ca-persian', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso));
  } catch {
    return null;
  }
}

/** One customer review (works in server and client trees: no hooks). */
export function ReviewCard({ review }: { review: Review }) {
  const date = faDate(review.published_at);
  return (
    <article className="space-y-3 rounded-lg border border-border bg-surface p-4">
      <header className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-subtle text-sm font-bold text-primary-on-subtle" aria-hidden>
          {review.author_name.trim().charAt(0)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2 text-sm font-bold text-text">
            {review.author_name}
            {review.is_verified_buyer ? <span className="rounded-full bg-primary-subtle px-2 py-0.5 text-[11px] font-medium text-primary-on-subtle">خریدار</span> : null}
          </p>
          {review.is_verified_buyer ? (
            <p className="mt-0.5 flex items-center gap-1 text-[11px] text-primary">
              <IconCheck size={12} strokeWidth={2.6} /> خریدار این محصول از بانویت
            </p>
          ) : null}
        </div>
        {review.rating ? (
          <div className="flex flex-col items-end gap-1">
            <Stars value={review.rating} />
            <span className="rounded-full bg-success-subtle px-2 text-[11px] leading-5 text-success-on-subtle">{LABELS[review.rating]}</span>
          </div>
        ) : null}
      </header>

      <p className="whitespace-pre-line text-sm leading-7 text-text-muted">{review.body}</p>

      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-xs text-text-subtle">
        <span>{review.variant_label ?? ''}</span>
        <span className="flex items-center gap-3">
          {date ? <time dateTime={review.published_at ?? undefined}>{date}</time> : null}
          {review.likes || review.dislikes ? (
            <>
              <span className="inline-flex items-center gap-1" aria-label={`${faDigits(review.likes)} نفر مفید دانستند`}>
                <IconThumbUp size={14} /> {faDigits(review.likes)}
              </span>
              <span className="inline-flex items-center gap-1" aria-label={`${faDigits(review.dislikes)} نفر مفید ندانستند`}>
                <IconThumbDown size={14} /> {faDigits(review.dislikes)}
              </span>
            </>
          ) : null}
        </span>
      </footer>
    </article>
  );
}
