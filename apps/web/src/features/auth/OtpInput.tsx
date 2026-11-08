'use client';

import { useRef } from 'react';
import { cx } from '@banovit/ui';
import { toLatinDigits, toPersianDigits } from '@/lib/auth/phone';

/**
 * N boxes (left-to-right, like the code in the SMS), Persian digits on
 * screen. `value` is the digits typed so far, always contiguous. Typing
 * advances, Backspace goes back, paste or SMS autofill
 * (autocomplete=one-time-code) fills every box at once.
 */
export function OtpInput({
  length,
  value,
  onChange,
  invalid,
  disabled,
  autoFocus,
}: {
  length: number;
  value: string;
  onChange: (v: string) => void;
  invalid?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  // Latest value without waiting for a re-render (fast typing / autofill).
  const current = useRef(value);
  current.current = value;
  const set = (v: string) => {
    current.current = v;
    onChange(v);
  };
  const focus = (i: number) => refs.current[Math.max(0, Math.min(length - 1, i))]?.focus();

  function typeAt(index: number, raw: string) {
    const digits = toLatinDigits(raw);
    if (!digits) return;
    const now = current.current;
    const start = Math.min(index, now.length);
    const next = (now.slice(0, start) + digits).slice(0, length);
    set(next);
    focus(next.length);
  }

  return (
    <div dir="ltr" className="flex justify-center gap-3" role="group" aria-label="کد تأیید">
      {Array.from({ length }, (_, i) => {
        const ch = value[i] ?? '';
        return (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            value={ch ? toPersianDigits(ch) : ''}
            inputMode="numeric"
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            disabled={disabled}
            autoFocus={autoFocus && i === 0}
            aria-label={`رقم ${toPersianDigits(i + 1)} از ${toPersianDigits(length)}`}
            aria-invalid={invalid || undefined}
            onFocus={(e) => {
              if (i > current.current.length) focus(current.current.length);
              else e.currentTarget.select();
            }}
            onChange={(e) => {
              const v = e.currentTarget.value;
              if (v === '') {
                set(current.current.slice(0, i));
                return;
              }
              // Box already had a digit: the browser appends; keep what was typed last.
              typeAt(i, ch && v.length === 2 && toLatinDigits(v).length === 2 ? v.slice(-1) : v);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Backspace' && !current.current[i]) {
                e.preventDefault();
                set(current.current.slice(0, Math.max(0, i - 1)));
                focus(i - 1);
              } else if (e.key === 'ArrowLeft') focus(i - 1);
              else if (e.key === 'ArrowRight') focus(i + 1);
            }}
            onPaste={(e) => {
              e.preventDefault();
              typeAt(i, e.clipboardData.getData('text'));
            }}
            className={cx(
              'size-14 rounded-md border bg-surface text-center text-2xl font-bold text-text outline-none transition-colors',
              'focus:border-primary focus:ring-2 focus:ring-focus/30 disabled:opacity-60',
              invalid ? 'border-danger' : ch ? 'border-primary' : 'border-border',
            )}
          />
        );
      })}
    </div>
  );
}
