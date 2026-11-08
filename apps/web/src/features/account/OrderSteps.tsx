import type { OrderStep } from '@banovit/api-client';
import { cx, IconCheckCircle, IconClock } from '@banovit/ui';

/** Four-step progress («پرداخت شده → درحال آماده‌سازی → ارسال مرسوله → تحویل کالا»). */
export function OrderSteps({ steps, size = 'sm' }: { steps: OrderStep[]; size?: 'sm' | 'md' }) {
  if (!steps.length) return null;
  return (
    <ol className="grid gap-1" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }} aria-label="مراحل سفارش">
      {steps.map((s) => (
        <li key={s.key} className="flex flex-col gap-1.5" aria-current={s.state === 'current' ? 'step' : undefined}>
          <span className={cx('h-1 rounded-full', s.state === 'upcoming' ? 'bg-border' : 'bg-primary')} />
          <span className={cx('flex items-start gap-1', size === 'sm' ? 'text-[10px]' : 'text-xs', s.state === 'upcoming' ? 'text-text-subtle' : s.state === 'current' ? 'font-bold text-text' : 'text-primary')}>
            {s.state === 'done' ? <IconCheckCircle size={12} className="shrink-0" /> : s.state === 'current' ? <IconClock size={12} className="shrink-0" /> : null}
            <span className="min-w-0 leading-4">{s.label}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}
