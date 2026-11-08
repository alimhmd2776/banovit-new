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
        'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-[13px] transition-colors duration-150',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
        active ? 'border-primary bg-primary-subtle text-primary-on-subtle' : 'border-border bg-surface text-text hover:border-border-strong',
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
      className="inline-flex h-8 shrink-0 items-center gap-1 rounded-full bg-primary-subtle ps-3 pe-2 text-xs text-primary-on-subtle hover:bg-primary hover:text-primary-on focus-visible:outline-2 focus-visible:outline-focus"
    >
      {label}
      <IconClose size={14} />
    </button>
  );
}
