'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { IconClose } from './icons';
import { cx } from './lib/format';

/**
 * Modal sheet: slides up from the bottom on mobile, becomes a side drawer from
 * `md` up. Focus is trapped while open, Escape and the backdrop close it, and
 * the page behind does not scroll.
 */
export function BottomSheet({
  open,
  onClose,
  title,
  children,
  footer,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  const titleId = useId();
  const panel = useRef<HTMLDivElement>(null);
  const opener = useRef<Element | null>(null);

  useEffect(() => {
    if (!open) return;
    opener.current = document.activeElement;
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = 'hidden';
    panel.current?.querySelector<HTMLElement>('[data-autofocus], button, input, a[href]')?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key !== 'Tab' || !panel.current) return;
      const focusable = panel.current.querySelectorAll<HTMLElement>('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusable.length === 0) return;
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      html.style.overflow = prevOverflow;
      (opener.current as HTMLElement | null)?.focus?.();
    };
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-drawer flex items-end md:items-stretch md:justify-end" role="presentation">
      <div className="absolute inset-0 bg-overlay animate-[fadeIn_150ms_ease-out]" onClick={onClose} aria-hidden="true" />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cx(
          'relative flex max-h-[88dvh] w-full flex-col rounded-t-lg bg-surface shadow-lg',
          'animate-[sheetUp_300ms_var(--ease-standard)] md:max-h-none md:w-[420px] md:rounded-none md:animate-[drawerIn_300ms_var(--ease-standard)]',
          className,
        )}
      >
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-border md:hidden" aria-hidden="true" />
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 id={titleId} className="text-base font-bold text-text">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن"
            className="inline-flex size-10 items-center justify-center rounded-full text-text-muted hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-focus"
          >
            <IconClose />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto overscroll-contain">{children}</div>
        {footer ? <footer className="border-t border-border bg-surface p-3 pb-[max(12px,env(safe-area-inset-bottom))]">{footer}</footer> : null}
      </div>
    </div>,
    document.body,
  );
}
