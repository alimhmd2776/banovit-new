'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useNavRouter as useRouter } from '@/lib/use-nav-router';
import { IconChevronRight, IconPhone, cx } from '@banovit/ui';
import type { Customer } from '@banovit/api-client';
import { normalizeMobile, toLatinDigits, toPersianDigits } from '@/lib/auth/phone';
import { Logo } from '@/features/menu/Logo';
import { AuthAvatar, BrandTile } from './AuthArt';
import { OtpInput } from './OtpInput';
import { TERMS_HREF, PRIVACY_HREF } from './links';

type Step = 'phone' | 'sending' | 'code' | 'profile';
type ApiError = { code: string; message: string; retry_after?: number; fields?: Record<string, string[]> };

const CODE_LENGTH = 4;

async function post<T>(url: string, body: unknown): Promise<{ ok: true; data: T } | { ok: false; error: ApiError }> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
      credentials: 'same-origin',
    });
    const json = (await res.json().catch(() => null)) as { data?: T; error?: ApiError } | null;
    if (res.ok && json?.data !== undefined) return { ok: true, data: json.data };
    return { ok: false, error: json?.error ?? { code: 'http_error', message: 'خطایی رخ داد. لطفاً دوباره تلاش کنید.' } };
  } catch {
    return { ok: false, error: { code: 'network', message: 'اتصال اینترنت را بررسی کنید و دوباره تلاش کنید.' } };
  }
}

function useCountdown() {
  const [left, setLeft] = useState(0);
  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);
  return [left, setLeft] as const;
}

const mmss = (s: number) => toPersianDigits(`${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`);

/**
 * Login / signup with mobile + 4-digit SMS code (designs/auth 02–08):
 * phone → «درحال ارسال کد» → code (resend countdown) → name step for new customers.
 * Talks only to the BFF (/api/auth/*); the session token never reaches this code.
 */
export function LoginFlow({ redirectTo, initialStep = 'phone' }: { redirectTo: string; initialStep?: 'phone' | 'profile' }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(initialStep);
  const [phoneInput, setPhoneInput] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [error, setError] = useState<ApiError | null>(null);
  const [busy, setBusy] = useState(false);
  const [resendIn, setResendIn] = useCountdown();
  const lastSubmitted = useRef('');
  // Remounts the code boxes (cleared, focus on the first) after a wrong code.
  const [otpKey, setOtpKey] = useState(0);

  const normalized = normalizeMobile(phoneInput);

  const finish = useCallback(() => {
    router.replace(redirectTo);
    router.refresh();
  }, [router, redirectTo]);

  async function requestCode(target: string) {
    setError(null);
    setBusy(true);
    setStep('sending');
    const started = Date.now();
    const res = await post<{ phone: string; resend_in: number }>('/api/auth/otp/', { phone: target });
    // Let the «sending» screen be seen instead of flashing.
    await new Promise((r) => setTimeout(r, Math.max(0, 700 - (Date.now() - started))));
    setBusy(false);
    if (res.ok) {
      setPhone(res.data.phone);
      setCode('');
      lastSubmitted.current = '';
      setResendIn(res.data.resend_in);
      setStep('code');
      return;
    }
    setError(res.error);
    if (res.error.code === 'otp_cooldown' && phone === target) {
      // A code was sent a moment ago: go back to the code screen with the real wait.
      setResendIn(res.error.retry_after ?? 60);
      setStep('code');
    } else {
      setStep(phone === target && step === 'code' ? 'code' : 'phone');
    }
  }

  async function verify(value: string) {
    if (busy || value.length !== CODE_LENGTH || lastSubmitted.current === value) return;
    lastSubmitted.current = value;
    setError(null);
    setBusy(true);
    const res = await post<{ is_new: boolean; customer: Customer }>('/api/auth/verify/', { phone, code: value });
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      if (res.error.code === 'otp_attempts_exceeded' || res.error.code === 'otp_expired') setResendIn(0);
      if (res.error.code.startsWith('otp_')) {
        setCode('');
        lastSubmitted.current = '';
        setOtpKey((k) => k + 1);
      }
      return;
    }
    if (res.data.customer.needs_profile) setStep('profile');
    else finish();
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError(null);
    setBusy(true);
    const res = await post<Customer>('/api/auth/profile/', { first_name: first.trim(), last_name: last.trim() });
    setBusy(false);
    if (res.ok) finish();
    else setError(res.error);
  }

  function back() {
    setError(null);
    if (step === 'code') setStep('phone');
    else if (step === 'profile') finish();
    else if (window.history.length > 1) router.back();
    else router.push('/');
  }

  const profileValid = first.trim().length >= 2 && last.trim().length >= 2;
  const fieldError = (name: string) => error?.fields?.[name]?.[0];

  return (
    <div className="flex min-h-full flex-col">
      <div className="relative flex h-16 items-center justify-center">
        {/* Shared wordmark (menu thread) so the live logo file replaces it everywhere at once. */}
        <Logo compact />
        {step !== 'sending' && (
          <button
            type="button"
            onClick={back}
            className="absolute start-0 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-md border border-border text-text hover:bg-surface-muted"
            aria-label={step === 'code' ? 'ویرایش شماره موبایل' : 'بازگشت'}
          >
            <IconChevronRight />
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col pt-12 lg:pt-8">
        {step === 'phone' && (
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              if (normalized && !busy) void requestCode(normalized);
            }}
          >
            <Heading active={!!normalized} title="ورود یا ثبت نام در بانویت" subtitle="لطفاً شماره موبایل خود را وارد کنید" />
            <label
              className={cx(
                'mt-6 flex h-14 items-center gap-2 rounded-lg border bg-surface px-4 transition-colors',
                'focus-within:border-primary focus-within:text-primary',
                error ? 'border-danger' : 'border-border',
              )}
            >
              <IconPhone size={18} className="shrink-0" />
              <span className="shrink-0 text-sm font-medium">شماره موبایل</span>
              <input
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                dir="ltr"
                autoFocus
                maxLength={16}
                placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                value={toPersianDigits(toLatinDigits(phoneInput))}
                onChange={(e) => {
                  setPhoneInput(e.currentTarget.value);
                  setError(null);
                }}
                aria-invalid={!!error || undefined}
                aria-describedby={error ? 'auth-error' : undefined}
                className="min-w-0 flex-1 bg-transparent text-start text-lg tracking-wider text-text outline-none placeholder:text-text-subtle"
              />
            </label>
            <ErrorText error={error} />
            <Terms />
            <SubmitButton disabled={!normalized || busy} busy={busy}>دریافت کد پیامکی</SubmitButton>
          </form>
        )}

        {step === 'sending' && (
          <div className="flex flex-1 flex-col items-center pt-16 text-center" role="status" aria-live="polite">
            <AuthAvatar active spinning size={104} />
            <p className="mt-6 font-bold text-text">درحال ارسال کد پیامکی ...</p>
            <p className="mt-1 text-sm text-text-muted">از صبر و شکیبایی شما سپاسگذاریم</p>
          </div>
        )}

        {step === 'code' && (
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              lastSubmitted.current = '';
              void verify(code);
            }}
          >
            <Heading
              active={code.length === CODE_LENGTH}
              title="کد پیامکی برای شما ارسال شد"
              subtitle={`کد پیامکی برای شماره (${toPersianDigits(phone)}) ارسال گردید`}
            />
            <div className="mt-6">
              <OtpInput
                key={otpKey}
                length={CODE_LENGTH}
                value={code}
                autoFocus
                disabled={busy}
                invalid={!!error && error.code.startsWith('otp')}
                onChange={(v) => {
                  setCode(v);
                  if (error && v.length > 0) setError(null);
                  if (v.length === CODE_LENGTH) void verify(v);
                }}
              />
            </div>
            <ErrorText error={error} />
            <Terms />
            <SubmitButton disabled={code.length !== CODE_LENGTH || busy} busy={busy}>{busy ? 'در حال بررسی…' : 'ورود به بانُویت'}</SubmitButton>
            <div className="mt-5 text-center text-sm">
              {resendIn > 0 ? (
                <p className="font-medium text-text-subtle" aria-live="off">
                  {mmss(resendIn)} تا دریافت مجدد
                </p>
              ) : (
                <button type="button" onClick={() => void requestCode(phone)} disabled={busy} className="font-bold text-primary hover:underline">
                  دریافت مجدد کد پیامکی
                </button>
              )}
            </div>
          </form>
        )}

        {step === 'profile' && (
          <form noValidate onSubmit={saveProfile}>
            <div className="flex flex-col items-center text-center">
              <BrandTile />
              <h1 className="mt-5 text-lg font-bold text-text">به خانواده بانُویت خوش‌آمدید!</h1>
              <p className="mt-1 text-sm text-text-muted">امیدواریم بتوانیم برای شما تجربه خوبی بسازیم.</p>
            </div>
            <hr className="my-5 border-border" />
            <div className="space-y-3">
              <FloatingField id="first_name" label="نام کوچک" value={first} onChange={setFirst} autoComplete="given-name" error={fieldError('first_name')} autoFocus />
              <FloatingField id="last_name" label="نام خانوادگی" value={last} onChange={setLast} autoComplete="family-name" error={fieldError('last_name')} />
            </div>
            {!error?.fields && <ErrorText error={error} />}
            <Terms />
            <SubmitButton disabled={!profileValid || busy} busy={busy}>ورود به بانُویت</SubmitButton>
          </form>
        )}
      </div>
    </div>
  );
}

function Heading({ title, subtitle, active }: { title: string; subtitle: string; active: boolean }) {
  return (
    <div className="flex flex-col items-center text-center">
      <AuthAvatar active={active} />
      <h1 className="mt-5 text-lg font-bold text-text">{title}</h1>
      <p className="mt-1 text-sm text-text-muted">{subtitle}</p>
    </div>
  );
}

function Terms() {
  return (
    <p className="mt-4 text-center text-xs text-text-subtle">
      ورود شما به معنای پذیرش{' '}
      <Link href={TERMS_HREF} className="text-primary hover:underline">
        شرایط بانُویت
      </Link>{' '}
      و{' '}
      <Link href={PRIVACY_HREF} className="text-primary hover:underline">
        قوانین حریم‌خصوصی
      </Link>{' '}
      است
    </p>
  );
}

function SubmitButton({ disabled, busy, children }: { disabled: boolean; busy?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      data-busy={busy || undefined}
      className="mt-8 h-14 w-full rounded-lg bg-primary text-base font-bold text-primary-on transition-colors hover:bg-primary-hover disabled:bg-surface-muted disabled:text-text-subtle"
    >
      {children}
    </button>
  );
}

function ErrorText({ error }: { error: ApiError | null }) {
  if (!error) return null;
  return (
    <p id="auth-error" role="alert" className="mt-3 text-center text-sm text-danger">
      {error.message}
    </p>
  );
}

function FloatingField({
  id,
  label,
  value,
  onChange,
  error,
  autoComplete,
  autoFocus,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  autoComplete: string;
  autoFocus?: boolean;
}) {
  return (
    <div>
      <div
        className={cx(
          'relative h-16 rounded-lg border bg-surface transition-colors focus-within:border-primary',
          error ? 'border-danger' : value ? 'border-primary' : 'border-border',
        )}
      >
        <input
          id={id}
          name={id}
          value={value}
          onChange={(e) => onChange(e.currentTarget.value)}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          required
          maxLength={50}
          placeholder=" "
          aria-invalid={!!error || undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="peer h-full w-full rounded-lg bg-transparent px-4 pt-5 text-base font-bold text-text outline-none"
        />
        <label
          htmlFor={id}
          className={cx(
            'pointer-events-none absolute start-4 text-text-muted transition-all',
            'top-1/2 -translate-y-1/2 text-sm',
            'peer-focus:top-3.5 peer-focus:text-xs peer-[:not(:placeholder-shown)]:top-3.5 peer-[:not(:placeholder-shown)]:text-xs',
          )}
        >
          {label} <span className="text-primary">*</span>
        </label>
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
