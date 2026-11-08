'use client';

import { useId, useRef, useState } from 'react';
import { IconCheckCircle, cx } from '@banovit/ui';
import { isIranMobile, latinDigits } from './format';

type Props = {
  title: string;
  messagePlaceholder: string | null;
  submitLabel: string;
  successMessage: string;
};

type Errors = Partial<Record<'name' | 'phone' | 'message' | 'form', string>>;
type Status = 'idle' | 'sending' | 'done';

/**
 * «درخواست مشاوره»: name + mobile (+ optional message) → BFF /api/callback-requests/
 * → CMS sales lead (signal «درخواست تماس از سایت», form=contact).
 */
export function ContactForm({ title, messagePlaceholder, submitLabel, successMessage }: Props) {
  const id = useId();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>('idle');
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);

  function validate(): Errors {
    const e: Errors = {};
    if (name.trim().length < 2) e.name = 'نام و نام خانوادگی را وارد کنید.';
    if (!isIranMobile(phone)) e.phone = 'شماره موبایل را درست وارد کنید (مثل ۰۹۱۲۳۴۵۶۷۸۹).';
    if (message.length > 1000) e.message = 'پیام حداکثر ۱۰۰۰ نویسه باشد.';
    return e;
  }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (e.name) return nameRef.current?.focus();
    if (e.phone) return phoneRef.current?.focus();
    if (e.message) return;

    setStatus('sending');
    try {
      const res = await fetch('/api/callback-requests/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          form: 'contact',
          name: name.trim(),
          phone: latinDigits(phone),
          message: message.trim() || undefined,
          page_url: window.location.pathname,
          page_title: 'تماس با ما',
          website: honeypotRef.current?.value || undefined,
        }),
      });
      if (res.ok) {
        setStatus('done');
        window.dataLayer?.push({ event: 'generate_lead', form_id: 'contact', lead_source: 'contact-us' });
        return;
      }
      const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
      setErrors({
        form: res.status === 429 ? 'درخواست‌های زیادی ثبت شد؛ کمی بعد دوباره امتحان کنید.' : body?.error?.message ?? 'ثبت نشد. دوباره تلاش کنید.',
      });
    } catch {
      setErrors({ form: 'ارتباط برقرار نشد. اتصال اینترنت را بررسی و دوباره تلاش کنید.' });
    }
    setStatus('idle');
  }

  if (status === 'done') {
    return (
      <div role="status" className="flex flex-col items-center gap-3 py-8 text-center">
        <IconCheckCircle size={48} className="text-success" />
        <p className="text-base font-bold text-text">درخواست شما ثبت شد</p>
        <p className="max-w-sm text-sm leading-7 text-text-muted">{successMessage}</p>
        <button
          type="button"
          onClick={() => {
            setStatus('idle');
            setMessage('');
          }}
          className="mt-2 text-sm font-medium text-primary hover:underline"
        >
          ارسال درخواست دیگر
        </button>
      </div>
    );
  }

  const fieldBox = (invalid: boolean) =>
    cx(
      'block rounded-md border bg-surface-muted px-4 pb-2.5 pt-2 transition-colors focus-within:border-primary focus-within:bg-surface',
      invalid ? 'border-danger' : 'border-transparent',
    );

  return (
    <form onSubmit={submit} noValidate aria-labelledby={`${id}-title`} className="flex flex-col gap-3">
      <h2 id={`${id}-title`} className="mb-1 text-lg font-bold text-text lg:text-xl">
        {title}
      </h2>

      <div>
        <label htmlFor={`${id}-name`} className={fieldBox(!!errors.name)}>
          <span className="block text-xs text-text-muted">
            نام و نام خانوادگی <span className="text-danger" aria-hidden="true">*</span>
          </span>
          <input
            ref={nameRef}
            id={`${id}-name`}
            name="name"
            autoComplete="name"
            required
            maxLength={100}
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? `${id}-name-err` : undefined}
            className="mt-1 w-full bg-transparent text-base font-bold text-text placeholder:font-normal placeholder:text-text-subtle focus:outline-none"
            placeholder="مثلاً مریم احمدی"
          />
        </label>
        {errors.name ? (
          <p id={`${id}-name-err`} className="mt-1 text-xs text-danger">
            {errors.name}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor={`${id}-phone`} className={fieldBox(!!errors.phone)}>
          <span className="block text-xs text-text-muted">
            شماره تماس <span className="text-danger" aria-hidden="true">*</span>
          </span>
          <input
            ref={phoneRef}
            id={`${id}-phone`}
            name="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            required
            maxLength={14}
            dir="ltr"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? `${id}-phone-err` : undefined}
            className="mt-1 w-full bg-transparent text-end text-base font-bold tracking-wider text-text placeholder:font-normal placeholder:text-text-subtle focus:outline-none"
            placeholder="۰۹۱۲۳۴۵۶۷۸۹"
          />
        </label>
        {errors.phone ? (
          <p id={`${id}-phone-err`} className="mt-1 text-xs text-danger">
            {errors.phone}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor={`${id}-message`} className="sr-only">
          پیام (اختیاری)
        </label>
        <textarea
          id={`${id}-message`}
          name="message"
          rows={3}
          maxLength={1000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={messagePlaceholder ?? 'پیام خود را بنویسید (اختیاری)'}
          aria-invalid={!!errors.message}
          className="block min-h-24 w-full resize-none rounded-md border border-transparent bg-surface px-1 py-2 text-center text-sm leading-7 text-text placeholder:text-text-muted focus:border-primary focus:px-4 focus:text-start focus:outline-none [&:not(:placeholder-shown)]:border-border [&:not(:placeholder-shown)]:px-4 [&:not(:placeholder-shown)]:text-start"
        />
        {errors.message ? <p className="mt-1 text-xs text-danger">{errors.message}</p> : null}
      </div>

      {/* honeypot: invisible to people and to assistive tech */}
      <div aria-hidden="true" className="absolute -start-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={`${id}-website`}>وب‌سایت</label>
        <input ref={honeypotRef} id={`${id}-website`} name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {errors.form ? (
        <p role="alert" className="rounded-sm bg-danger-subtle px-4 py-3 text-sm text-danger-on-subtle">
          {errors.form}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === 'sending'}
        data-busy={status === 'sending' || undefined}
        className="mt-1 h-12 rounded-full bg-primary text-base font-bold text-primary-on transition-colors hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:opacity-60 lg:h-14"
      >
        {status === 'sending' ? 'در حال ارسال…' : submitLabel}
      </button>
    </form>
  );
}

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}
