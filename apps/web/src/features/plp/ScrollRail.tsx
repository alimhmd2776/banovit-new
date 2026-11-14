'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * One-line horizontal scroller. Touch/trackpad scroll everywhere; on desktop
 * (no touch swipe) prev/next buttons appear while there is more to scroll.
 * RTL: scrollLeft is 0 at the start and negative towards the end.
 */
export function ScrollRail({ children, label, className = '' }: { children: ReactNode; label: string; className?: string }) {
  const ref = useRef<HTMLUListElement>(null);
  const [canStart, setCanStart] = useState(false);
  const [canEnd, setCanEnd] = useState(false);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const pos = Math.abs(el.scrollLeft);
    setCanStart(pos > 2);
    setCanEnd(max - pos > 2);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    update();
    el.addEventListener('scroll', update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', update);
      ro.disconnect();
    };
  }, [update]);

  const move = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const rtl = getComputedStyle(el).direction === 'rtl';
    el.scrollBy({ left: dir * (rtl ? -1 : 1) * el.clientWidth * 0.8, behavior: 'smooth' });
  };

  const btn =
    'absolute top-[36px] z-10 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-bg text-text shadow-sm hover:border-primary hover:text-primary lg:flex lg:top-10';

  return (
    <div className="relative">
      <ul ref={ref} className={`flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth scrollbar-none ${className}`}>
        {children}
      </ul>
      {canStart ? (
        <button type="button" aria-label={`${label}: قبلی`} onClick={() => move(-1)} className={`${btn} start-0`}>
          <svg viewBox="0 0 24 24" className="size-5 rtl:rotate-180" aria-hidden="true"><path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      ) : null}
      {canEnd ? (
        <button type="button" aria-label={`${label}: بعدی`} onClick={() => move(1)} className={`${btn} end-0`}>
          <svg viewBox="0 0 24 24" className="size-5 rtl:rotate-180" aria-hidden="true"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      ) : null}
    </div>
  );
}
