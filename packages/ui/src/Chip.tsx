import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { IconClose } from './icons';
import { cx } from './lib/format';

/** Toolbar chip (sort / filter buttons). */
export function Chip({
  active = false,
  icon,
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean; icon?: ReactNode }) {
  return (
    <button
      type="button"
      className={cx(
        'relative inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border px-4 text-[13px] font-medium transition-colors duration-150',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
        active ? 'border-primary bg-primary-subtle text-primary' : 'border-border bg-surface text-text hover:border-border-strong',
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}

/** Removable active-filter pill. */
export function FilterPill({ label, onRemove, removeLabel }: { label: string; onRemove: () => void; removeLabel?: string }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      aria-label={removeLabel ?? `حذف فیلتر ${label}`}
      className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-primary-subtle ps-4 pe-3 text-[13px] font-medium text-primary hover:bg-[var(--brand-100)] focus-visible:outline-2 focus-visible:outline-focus"
    >
      {label}
      <IconClose size={16} />
    </button>
  );
}
