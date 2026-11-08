'use client';

import { IconMinus, IconPlus, IconTrash } from './icons';
import { cx, faDigits } from './lib/format';

/**
 * «+ ۲ عدد −» stepper. At quantity 1 the minus becomes a delete button (cart
 * design). Buttons are 44px touch targets; the count is announced politely.
 */
export function QuantityStepper({
  value,
  max = 99,
  onChange,
  onRemove,
  busy = false,
  label,
  className,
}: {
  value: number;
  max?: number;
  onChange: (next: number) => void;
  onRemove?: () => void;
  busy?: boolean;
  /** Product name, for accessible button names. */
  label: string;
  className?: string;
}) {
  const atMin = value <= 1;
  return (
    <div
      className={cx('inline-flex h-11 items-center rounded-sm border border-border bg-surface', busy && 'opacity-70', className)}
      role="group"
      aria-label={`تعداد ${label}`}
    >
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={busy || value >= max}
        aria-label={`افزایش تعداد ${label}`}
        className="inline-flex size-11 items-center justify-center rounded-sm text-text hover:bg-surface-muted disabled:text-text-subtle focus-visible:outline-2 focus-visible:outline-focus"
      >
        <IconPlus size={18} />
      </button>
      <output aria-live="polite" className="min-w-14 text-center text-sm font-bold text-text">
        {faDigits(value)} <span className="font-normal">عدد</span>
      </output>
      {atMin && onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          disabled={busy}
          aria-label={`حذف ${label} از سبد`}
          className="inline-flex size-11 items-center justify-center rounded-sm text-danger hover:bg-danger-subtle focus-visible:outline-2 focus-visible:outline-focus"
        >
          <IconTrash size={18} />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => onChange(value - 1)}
          disabled={busy || atMin}
          aria-label={`کاهش تعداد ${label}`}
          className="inline-flex size-11 items-center justify-center rounded-sm text-text hover:bg-surface-muted disabled:text-text-subtle focus-visible:outline-2 focus-visible:outline-focus"
        >
          <IconMinus size={18} />
        </button>
      )}
    </div>
  );
}
