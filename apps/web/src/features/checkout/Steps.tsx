import { cx, faDigits } from '@banovit/ui';

const STEPS = ['سبد خرید', 'اطلاعات ارسال', 'پرداخت'];

/** Desktop step indicator (mobile relies on the page title + back button). */
export function Steps({ current }: { current: 1 | 2 }) {
  return (
    <nav aria-label="مراحل خرید" className="mx-auto hidden max-w-container px-4 pt-6 lg:block">
      <ol className="flex items-center gap-3 text-sm">
        {STEPS.map((s, i) => {
          const state = i < current ? 'done' : i === current ? 'current' : 'todo';
          return (
            <li key={s} className="flex items-center gap-3" aria-current={state === 'current' ? 'step' : undefined}>
              {i > 0 ? <span className={cx('h-px w-12', state === 'todo' ? 'bg-border' : 'bg-primary')} aria-hidden="true" /> : null}
              <span
                className={cx(
                  'inline-flex size-7 items-center justify-center rounded-full text-xs font-bold',
                  state === 'todo' ? 'bg-surface-muted text-text-muted' : 'bg-primary text-primary-on',
                )}
              >
                {faDigits(i + 1)}
              </span>
              <span className={state === 'current' ? 'font-bold text-text' : 'text-text-muted'}>{s}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
