'use client';

import { useState } from 'react';
import type { ListingSettings } from '@banovit/api-client';
import { faDigits, IconPhone } from '@banovit/ui';

type Status = { kind: 'idle' } | { kind: 'sending' } | { kind: 'done' } | { kind: 'error'; message: string };

/** «مشاوره رایگان»: visitor leaves a mobile number, sales calls back (CMS lead signal). */
export function SupportCalloutForm({
  box,
  phone,
  pageTitle,
}: {
  box: ListingSettings['support_box'];
  /** First phone of «صفحه تماس با ما» */
  phone: { tel: string; number: string } | null;
  pageTitle: string;
}) {
  const [value, setValue] = useState('');
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const digits = value.replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/\D/g, '');
    if (!/^09\d{9}$/.test(digits)) {
      setStatus({ kind: 'error', message: 'شماره موبایل را درست وارد کنید (مثل ۰۹۱۲۳۴۵۶۷۸۹).' });
      return;
    }
    setStatus({ kind: 'sending' });
    try {
      const res = await fetch('/api/callback-requests/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: digits, page_url: window.location.pathname, page_title: pageTitle }),
      });
      if (res.ok) return setStatus({ kind: 'done' });
      const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
      setStatus({ kind: 'error', message: res.status === 429 ? 'درخواست‌های زیادی ثبت شد؛ کمی بعد دوباره امتحان کنید.' : body?.error?.message ?? 'ثبت نشد. دوباره تلاش کنید.' });
    } catch {
      setStatus({ kind: 'error', message: 'ارتباط برقرار نشد. دوباره تلاش کنید.' });
    }
  }

  return (
    <section aria-labelledby="support-title" className="px-4 pt-6 lg:flex lg:items-center lg:justify-between lg:gap-12 lg:rounded-lg lg:bg-primary-subtle lg:p-8">
      <div className="mb-5 lg:mb-0">
        <h2 id="support-title" className="text-lg font-bold text-text">
          {box.title}
        </h2>
        <p className="mt-2 text-sm leading-7 text-text-muted">
          {box.text}
          {phone ? (<span className="mt-1 hidden lg:block">
            یا همین حالا تماس بگیرید:{' '}
            <a href={`tel:${phone.tel}`} className="inline-flex items-center gap-1 font-bold text-primary">
              <IconPhone size={16} />
              <span dir="ltr">{faDigits(phone.number)}</span>
            </a>
          </span>) : null}
        </p>
      </div>

      {status.kind === 'done' ? (
        <p role="status" className="rounded-sm bg-success-subtle px-4 py-3 text-sm font-medium text-success-on-subtle">
          {box.success}
        </p>
      ) : (
        <form onSubmit={submit} noValidate className="flex w-full flex-col gap-2 lg:max-w-md">
          <div className="flex flex-col gap-2">
            <label htmlFor="callback-phone" className="sr-only">
              شماره موبایل
            </label>
            <input
              id="callback-phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              dir="ltr"
              placeholder={box.placeholder ?? ''}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              aria-invalid={status.kind === 'error'}
              aria-describedby={status.kind === 'error' ? 'callback-error' : undefined}
              className="h-14 min-w-0 rounded-[14px] border border-border bg-surface px-4 text-start text-base tracking-wider placeholder:text-text-subtle focus:border-primary focus:outline-none"
            />
            <button
              type="submit"
              disabled={status.kind === 'sending'}
              data-busy={status.kind === 'sending' || undefined}
              className="h-14 w-full rounded-[14px] bg-primary px-5 text-sm font-bold text-primary-on hover:bg-primary-hover disabled:opacity-60"
            >
              {status.kind === 'sending' ? 'در حال ثبت…' : box.button}
            </button>
          </div>
          {status.kind === 'error' ? (
            <p id="callback-error" role="alert" className="text-xs text-danger">
              {status.message}
            </p>
          ) : null}
        </form>
      )}
    </section>
  );
}
