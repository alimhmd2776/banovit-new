'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';
import { isOtherPage, onNavProgress } from '@/lib/nav-progress';

/**
 * Thin bar at the very top of the page that starts the moment the visitor
 * clicks a link (or code calls startNavProgress) and finishes when the new
 * URL is rendered, so a click never looks like it did nothing.
 */
type Phase = 'idle' | 'loading' | 'done';

const SAFETY_MS = 15_000;

function Bar() {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const [phase, setPhase] = useState<Phase>('idle');
  const [width, setWidth] = useState(0);
  const timers = useRef<number[]>([]);
  const first = useRef(true);

  const clear = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  const finish = () => {
    clear();
    setPhase((p) => (p === 'idle' ? p : 'done'));
    setWidth(100);
    timers.current.push(window.setTimeout(() => { setPhase('idle'); setWidth(0); }, 350));
  };

  const start = () => {
    clear();
    setPhase('loading');
    setWidth(8);
    // Trickle towards 90% without ever reaching it.
    let w = 8;
    const tick = () => {
      w += (90 - w) * 0.12;
      setWidth(w);
      timers.current.push(window.setTimeout(tick, 250));
    };
    timers.current.push(window.setTimeout(tick, 60));
    timers.current.push(window.setTimeout(finish, SAFETY_MS));
  };

  // A new URL has been rendered: complete the bar.
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, search]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.('a');
      if (!a || !a.href || a.hasAttribute('download')) return;
      const target = a.getAttribute('target');
      if (target && target !== '_self') return;
      if (isOtherPage(a.href)) start();
    };
    const onPop = () => start();
    // Capture phase: next/link calls preventDefault in its own handler.
    document.addEventListener('click', onClick, true);
    window.addEventListener('popstate', onPop);
    const off = onNavProgress(start, finish);
    return () => {
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('popstate', onPop);
      off();
      clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (phase === 'idle') return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[2147483000] h-[3px]" role="progressbar" aria-label="در حال بارگذاری" aria-busy={phase === 'loading'}>
      <div
        className="h-full bg-primary shadow-[0_0_8px_var(--color-primary)] transition-[width,opacity] duration-300 ease-out"
        style={{ width: `${width}%`, opacity: phase === 'done' ? 0 : 1, marginInlineStart: 0 }}
      />
    </div>
  );
}

export function NavigationProgress() {
  return (
    <Suspense fallback={null}>
      <Bar />
    </Suspense>
  );
}
