'use client';

import { useState } from 'react';
import type { Review, ReviewListing } from '@banovit/api-client';
import { BottomSheet, cx, IconChat, IconChevronLeft, IconStar } from '@banovit/ui';
import { ReviewCard } from './ReviewCard';

/** «مشاهده همه»: loads the remaining approved reviews below the server-rendered ones. */
export function MoreReviews({ slug, shownIds, total }: { slug: string; shownIds: number[]; total: number }) {
  const [items, setItems] = useState<Review[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const remaining = total - shownIds.length - items.length;
  if (remaining <= 0) return items.length ? <List items={items} /> : null;

  async function load() {
    setLoading(true);
    try {
      // Page 1 starts with the reviews already rendered by the server; they are skipped by id.
      const res = await fetch(`/api/products/${encodeURIComponent(slug)}/reviews/?page=${page}`);
      const body = (await res.json()) as ReviewListing;
      setItems((prev) => {
        const seen = new Set([...shownIds, ...prev.map((r) => r.id)]);
        return [...prev, ...body.data.filter((r) => !seen.has(r.id))];
      });
      setPage((p) => p + 1);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <List items={items} />
      <button type="button" onClick={load} disabled={loading} data-busy={loading || undefined} className="flex w-full items-center justify-center gap-1 rounded-md border border-border py-3 text-sm font-medium text-primary hover:border-primary disabled:opacity-60">
        {loading ? 'در حال بارگذاری…' : 'نمایش دیدگاه‌های بیشتر'}
      </button>
    </>
  );
}

function List({ items }: { items: Review[] }) {
  return (
    <ul className="space-y-3">
      {items.map((r) => (
        <li key={r.id}>
          <ReviewCard review={r} />
        </li>
      ))}
    </ul>
  );
}

type FormStatus = { kind: 'idle' } | { kind: 'sending' } | { kind: 'done' } | { kind: 'error'; message: string; fields?: Record<string, string[]> };

/** «دیدگاه خود را درباره این محصول ثبت کنید» row + form sheet. Reviews are moderated before they appear. */
export function WriteReview({ slug, productName, variationId }: { slug: string; productName: string; variationId?: number | null }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [status, setStatus] = useState<FormStatus>({ kind: 'idle' });

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    if (!rating) return setStatus({ kind: 'error', message: 'امتیاز را از ۱ تا ۵ انتخاب کنید.' });
    setStatus({ kind: 'sending' });
    try {
      const res = await fetch(`/api/products/${encodeURIComponent(slug)}/reviews/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author_name: form.get('author_name'),
          phone: form.get('phone') || undefined,
          body: form.get('body'),
          rating,
          variation_id: variationId ?? null,
        }),
      });
      if (res.ok) return setStatus({ kind: 'done' });
      const body = (await res.json().catch(() => null)) as { error?: { message?: string; fields?: Record<string, string[]> } } | null;
      setStatus({
        kind: 'error',
        message: res.status === 429 ? 'درخواست‌های زیادی ثبت شد؛ کمی بعد دوباره امتحان کنید.' : body?.error?.message ?? 'ثبت نشد. دوباره تلاش کنید.',
        fields: body?.error?.fields,
      });
    } catch {
      setStatus({ kind: 'error', message: 'ارتباط برقرار نشد. دوباره تلاش کنید.' });
    }
  }

  const fieldError = (name: string) => (status.kind === 'error' ? status.fields?.[name]?.[0] : undefined);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className="flex w-full items-center gap-3 rounded-md py-3 text-start hover:bg-surface-muted/60"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border text-text">
          <IconChat size={20} />
        </span>
        <span className="flex-1">
          <span className="block text-sm font-bold text-text">دیدگاه خود را درباره این محصول ثبت کنید</span>
          <span className="mt-0.5 block text-xs text-text-muted">با ثبت دیدگاه، به بقیه مشتریان تجربیات خود را در میان بگذارید!</span>
        </span>
        <IconChevronLeft size={18} className="text-text-subtle" />
      </button>

      <BottomSheet open={open} onClose={() => setOpen(false)} title="ثبت دیدگاه">
        {status.kind === 'done' ? (
          <p role="status" className="rounded-sm bg-success-subtle p-4 text-sm leading-7 text-success-on-subtle">
            ممنون از شما! دیدگاه‌تان ثبت شد و پس از بررسی نمایش داده می‌شود.
          </p>
        ) : (
          <form onSubmit={submit} noValidate className="space-y-4">
            <p className="text-sm text-text-muted">{productName}</p>
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-text">امتیاز شما</legend>
              <div className="flex gap-1" role="radiogroup" aria-label="امتیاز">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={rating === n}
                    aria-label={`${n} از ۵`}
                    onClick={() => setRating(n)}
                    className="flex size-10 items-center justify-center rounded-full hover:bg-surface-muted"
                  >
                    <IconStar size={26} className={cx(n <= rating ? 'fill-[var(--color-rating)] text-rating' : 'text-border-strong')} />
                  </button>
                ))}
              </div>
            </fieldset>
            <Field label="نام" name="author_name" error={fieldError('author_name')} autoComplete="name" required />
            <Field label="شماره موبایل (اختیاری، نمایش داده نمی‌شود)" name="phone" error={fieldError('phone')} type="tel" inputMode="numeric" dir="ltr" autoComplete="tel" />
            <div>
              <label htmlFor="review-body" className="mb-1.5 block text-sm font-medium text-text">
                متن دیدگاه
              </label>
              <textarea
                id="review-body"
                name="body"
                rows={5}
                required
                minLength={10}
                maxLength={3000}
                aria-invalid={!!fieldError('body') || undefined}
                className="w-full rounded-sm border border-border-strong bg-surface p-3 text-sm leading-7 focus:border-primary focus:outline-none"
              />
              {fieldError('body') ? <p className="mt-1 text-xs text-danger">{fieldError('body')}</p> : null}
            </div>
            {status.kind === 'error' && !status.fields ? (
              <p role="alert" className="text-xs text-danger">
                {status.message}
              </p>
            ) : null}
            <button type="submit" disabled={status.kind === 'sending'} data-busy={status.kind === 'sending' || undefined} className="h-12 w-full rounded-sm bg-primary text-sm font-bold text-primary-on hover:bg-primary-hover disabled:opacity-60">
              {status.kind === 'sending' ? 'در حال ثبت…' : 'ثبت دیدگاه'}
            </button>
          </form>
        )}
      </BottomSheet>
    </>
  );
}

function Field({ label, name, error, ...props }: { label: string; name: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = `review-${name}`;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-text">
        {label}
      </label>
      <input
        id={id}
        name={name}
        aria-invalid={!!error || undefined}
        className="h-12 w-full rounded-sm border border-border-strong bg-surface px-3 text-sm focus:border-primary focus:outline-none"
        {...props}
      />
      {error ? <p className="mt-1 text-xs text-danger">{error}</p> : null}
    </div>
  );
}
