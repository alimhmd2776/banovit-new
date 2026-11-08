'use client';

import { useEffect, useState } from 'react';
import type { OpeningDay } from '@banovit/api-client';
import { cx, faDigits, IconChevronDown, IconClock } from '@banovit/ui';
import { openStatus, rangesLabel, type OpenStatus } from './hours';

/**
 * «امروز از ساعت ۰۸:۰۰ تا ۲۳:۰۰» + «باز است» pill, expanding to the weekly
 * table. Status depends on the current time, so it is computed after mount
 * (the HTML is cached); the weekly table is server-rendered.
 */
export function OpeningHours({ days }: { days: OpeningDay[] }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<OpenStatus | null>(null);

  useEffect(() => {
    const tick = () => setStatus(openStatus(days, new Date()));
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, [days]);

  const todayText = status?.today
    ? (() => {
        const label = rangesLabel(status.today, faDigits);
        return label ? `امروز از ساعت ${label}` : 'امروز تعطیل است';
      })()
    : 'ساعت کاری فروشگاه';

  return (
    <div className="rounded-lg bg-surface-muted">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="seller-hours"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-4 py-4 text-start"
      >
        <IconClock size={22} className="shrink-0 text-text" />
        {status?.isOpen != null ? (
          <span
            className={cx(
              'shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium',
              status.isOpen ? 'border-primary bg-primary-subtle text-primary-on-subtle' : 'border-danger bg-danger-subtle text-danger-on-subtle',
            )}
          >
            {status.isOpen ? 'باز است' : 'بسته است'}
          </span>
        ) : null}
        <span className="flex-1 text-sm font-bold text-text lg:text-base">{todayText}</span>
        <IconChevronDown size={20} className={cx('shrink-0 text-text-muted transition-transform', open && 'rotate-180')} />
      </button>
      <div id="seller-hours" hidden={!open} className="px-2 pb-2">
        <dl className="space-y-1 rounded-md bg-surface px-4 py-3">
          {days.map((d) => {
            const label = rangesLabel(d, faDigits);
            return (
              <div key={d.day} className="flex items-center justify-between py-2 text-sm lg:text-base">
                <dt className={cx('text-text-muted', status?.today?.day === d.day && 'font-bold text-text')}>{d.label}</dt>
                <dd className={cx('font-bold', label ? 'text-text' : 'text-danger')}>{label ?? 'تعطیل است'}</dd>
              </div>
            );
          })}
        </dl>
      </div>
    </div>
  );
}
