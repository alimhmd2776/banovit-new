'use client';

import { useId, useState } from 'react';
import type { VanityCalculator as Calc } from '@banovit/api-client';
import { cx, faDigits, formatToman, IconCheck, IconPhone } from '@banovit/ui';

/** Persian/Arabic digits -> ASCII, keep digits only. */
const toAscii = (v: string) => v.replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace(/\D/g, '');

/** Same formula as the live form (WP template 41787), with the rates the CMS sends. */
export function vanityEstimate(c: Calc, lengthCm: number, bowls: number, frame: boolean): number {
  const perCm = c.slab_price_per_cm.amount + (frame ? c.frame_price_per_cm.amount : 0);
  return lengthCm * perCm + bowls * c.bowl_price.amount;
}

type Status = { kind: 'idle' } | { kind: 'sending' } | { kind: 'done' } | { kind: 'error'; message: string };

/**
 * «فرم محاسبه قیمت» of the public-vanity products: live estimate while typing,
 * then «ثبت درخواست» sends the inputs and the estimate as a sales lead
 * (callback-requests, form=product_quote) so a consultant calls back.
 */
export function VanityCalculator({ calc, productName, consultPhone }: { calc: Calc; productName: string; consultPhone: string }) {
  const id = useId();
  const [length, setLength] = useState('');
  const [bowls, setBowls] = useState(String(calc.min_bowls));
  const [frame, setFrame] = useState(false);
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  const L = Number(toAscii(length) || 0);
  const N = Number(toAscii(bowls) || 0);
  const lengthError = length !== '' && (L < calc.min_length_cm || L > calc.max_length_cm) ? `طول صفحه بین ${faDigits(calc.min_length_cm)} تا ${faDigits(calc.max_length_cm)} سانتی‌متر است.` : null;
  const bowlsError = bowls !== '' && (N < calc.min_bowls || N > calc.max_bowls) ? `تعداد کاسه بین ${faDigits(calc.min_bowls)} تا ${faDigits(calc.max_bowls)} عدد است.` : null;
  const valid = L > 0 && N > 0 && !lengthError && !bowlsError;
  const estimate = valid ? vanityEstimate(calc, L, N, frame) : null;
  const perMeter = (c: number) => formatToman(c * 100);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const digits = toAscii(phone);
    if (!valid || estimate === null) {
      setStatus({ kind: 'error', message: 'طول صفحه و تعداد کاسه را درست وارد کنید.' });
      return;
    }
    if (!/^09\d{9}$/.test(digits)) {
      setStatus({ kind: 'error', message: 'شماره موبایل را درست وارد کنید (مثل ۰۹۱۲۳۴۵۶۷۸۹).' });
      return;
    }
    setStatus({ kind: 'sending' });
    const message = [
      `محصول: ${productName}`,
      `طول صفحه: ${L} سانتی‌متر (عرض ${calc.width_cm})`,
      `تعداد کاسه: ${N}`,
      `${calc.frame_label}: ${frame ? 'می‌خواهم' : 'نمی‌خواهم'}`,
      `قیمت تقریبی: ${formatToman(estimate)} تومان`,
    ].join('\n');
    try {
      const res = await fetch('/api/callback-requests/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: digits, form: 'product_quote', message, page_url: window.location.pathname, page_title: productName }),
      });
      if (res.ok) return setStatus({ kind: 'done' });
      const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
      setStatus({ kind: 'error', message: res.status === 429 ? 'درخواست‌های زیادی ثبت شد؛ کمی بعد دوباره امتحان کنید.' : body?.error?.message ?? 'ثبت نشد. دوباره تلاش کنید.' });
    } catch {
      setStatus({ kind: 'error', message: 'ارتباط برقرار نشد. دوباره تلاش کنید.' });
    }
  }

  const field = 'h-12 w-full rounded-md border border-border bg-surface px-3 text-sm text-text placeholder:text-text-subtle focus:border-primary focus:outline-none';

  return (
    <section id="price-calculator" aria-labelledby={`${id}-t`} className="scroll-mt-28 rounded-lg border border-primary/20 bg-primary-subtle/50 p-4 lg:p-5">
      <h2 id={`${id}-t`} className="text-[15px] font-bold text-text">
        {calc.title}
      </h2>
      <p className="mt-1 text-xs leading-6 text-text-muted">
        هر متر صفحه {perMeter(calc.slab_price_per_cm.amount)} تومان در عرض {faDigits(calc.width_cm)} سانتی‌متر؛ قیمت هر کاسه {formatToman(calc.bowl_price.amount)} تومان.
      </p>

      <form onSubmit={submit} noValidate className="mt-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-text">طول صفحه (سانتی‌متر)</span>
            <input
              inputMode="numeric"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              placeholder={`حداقل ${faDigits(calc.min_length_cm)}`}
              aria-invalid={!!lengthError}
              className={cx(field, lengthError && 'border-danger')}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-text">تعداد کاسه</span>
            <input
              inputMode="numeric"
              value={bowls}
              onChange={(e) => setBowls(e.target.value)}
              placeholder={`حداقل ${faDigits(calc.min_bowls)}`}
              aria-invalid={!!bowlsError}
              className={cx(field, bowlsError && 'border-danger')}
            />
          </label>
        </div>
        {lengthError || bowlsError ? <p className="text-xs text-danger">{lengthError ?? bowlsError}</p> : null}

        <label className="flex cursor-pointer items-start gap-3 rounded-md border border-border bg-surface p-3">
          <input type="checkbox" checked={frame} onChange={(e) => setFrame(e.target.checked)} className="mt-1 size-4 accent-[var(--color-primary)]" />
          <span className="text-sm text-text">
            {calc.frame_label}
            <span className="mt-0.5 block text-xs text-text-muted">متری {perMeter(calc.frame_price_per_cm.amount)} تومان اضافه</span>
          </span>
        </label>

        <div className="flex items-baseline justify-between rounded-md bg-surface p-3" aria-live="polite">
          <span className="text-sm text-text-muted">قیمت تقریبی</span>
          <span className="text-lg font-extrabold text-text">
            {estimate !== null ? (
              <>
                {formatToman(estimate)} <span className="text-xs font-normal text-text-muted">تومان</span>
              </>
            ) : (
              <span className="text-sm font-normal text-text-subtle">ابعاد را وارد کنید</span>
            )}
          </span>
        </div>

        {status.kind === 'done' ? (
          <p role="status" className="flex items-center gap-2 rounded-md bg-success/10 p-3 text-sm text-success">
            <IconCheck size={18} /> درخواست شما ثبت شد؛ کارشناسان بانویت به‌زودی تماس می‌گیرند.
          </p>
        ) : (
          <div className="space-y-2">
            <span className="block text-xs text-text-muted">برای ثبت سفارش و مشاوره رایگان، شماره موبایل خود را وارد کنید:</span>
            <div className="flex gap-2">
              <input
                type="tel"
                inputMode="tel"
                dir="ltr"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="09xxxxxxxxx"
                aria-label="شماره موبایل"
                className={cx(field, 'flex-1 text-left')}
              />
              <button
                type="submit"
                disabled={status.kind === 'sending'}
                data-busy={status.kind === 'sending' || undefined}
                className="h-12 shrink-0 whitespace-nowrap rounded-md bg-primary px-5 text-sm font-bold text-primary-on hover:bg-primary-hover disabled:opacity-70"
              >
                {status.kind === 'sending' ? 'در حال ثبت…' : 'ثبت درخواست'}
              </button>
            </div>
            {status.kind === 'error' ? (
              <p role="alert" className="text-xs text-danger">
                {status.message}
              </p>
            ) : null}
            <a href={`tel:${consultPhone}`} className="inline-flex items-center gap-1 text-xs font-medium text-primary">
              <IconPhone size={14} /> یا همین حالا تماس بگیرید: <span dir="ltr">{faDigits(consultPhone)}</span>
            </a>
          </div>
        )}
      </form>
    </section>
  );
}

/** «این محصول سفارشی تولید می‌شود» box for made-to-order products (replaces the buy controls). */
export function MadeToOrderBox({ title, note, phone, hasCalculator }: { title: string; note: string | null; phone: string; hasCalculator: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-surface-muted p-4">
      <p className="text-sm font-bold text-text">{title}</p>
      {note ? <div className="prose-pdp mt-1 text-xs leading-6 text-text-muted" dangerouslySetInnerHTML={{ __html: note }} /> : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <a href={`tel:${phone}`} className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-sm font-bold text-primary-on hover:bg-primary-hover">
          <IconPhone size={16} /> مشاوره رایگان <span dir="ltr">{faDigits(phone)}</span>
        </a>
        {hasCalculator ? (
          <a href="#price-calculator" className="inline-flex h-10 items-center rounded-full border border-primary px-4 text-sm font-bold text-primary">
            محاسبه قیمت
          </a>
        ) : null}
      </div>
    </div>
  );
}
