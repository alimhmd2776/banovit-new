'use client';

import { cx } from './lib/format';

export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}) {
  return (
    <label className={cx('flex min-h-12 cursor-pointer items-center justify-between gap-3', disabled && 'cursor-not-allowed opacity-50')}>
      <span className="flex flex-col">
        <span className="text-sm text-text">{label}</span>
        {description ? <span className="text-xs text-text-muted">{description}</span> : null}
      </span>
      <span className="relative inline-flex">
        <input
          type="checkbox"
          role="switch"
          className="peer sr-only"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="h-6 w-11 rounded-full bg-border-strong transition-colors duration-150 peer-checked:bg-primary peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus" />
        <span className="absolute top-0.5 start-0.5 size-5 rounded-full bg-surface shadow-xs transition-transform duration-150 peer-checked:-translate-x-5" />
      </span>
    </label>
  );
}

export function Checkbox({
  checked,
  onChange,
  label,
  count,
  swatch,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  count?: number;
  swatch?: string | null;
}) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-text">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-5 shrink-0 accent-[var(--color-primary)]"
      />
      {swatch !== undefined ? (
        <span className="size-5 shrink-0 rounded-full border border-border-strong" style={{ backgroundColor: swatch ?? 'transparent' }} aria-hidden="true" />
      ) : null}
      <span className="flex-1">{label}</span>
      {count !== undefined ? <span className="text-xs text-text-subtle">{new Intl.NumberFormat('fa-IR').format(count)}</span> : null}
    </label>
  );
}
