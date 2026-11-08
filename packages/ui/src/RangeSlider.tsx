'use client';

import { useCallback } from 'react';

/**
 * Two-thumb range on two native range inputs (keyboard + screen-reader support
 * for free). In RTL the minimum sits on the right, like the rest of the UI.
 */
export function RangeSlider({
  min,
  max,
  step = 1,
  value,
  onChange,
  formatValue = String,
  labels = { min: 'حداقل', max: 'حداکثر' },
}: {
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  onChange: (v: [number, number]) => void;
  formatValue?: (n: number) => string;
  labels?: { min: string; max: string };
}) {
  const span = Math.max(1, max - min);
  const [lo, hi] = value;
  const pct = useCallback((v: number) => ((v - min) / span) * 100, [min, span]);
  const thumb =
    'pointer-events-none absolute inset-0 h-6 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-6 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:bg-surface [&::-webkit-slider-thumb]:shadow-sm [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary [&::-moz-range-thumb]:bg-surface focus-visible:outline-none [&:focus-visible::-webkit-slider-thumb]:outline-2 [&:focus-visible::-webkit-slider-thumb]:outline-focus';

  return (
    <div className="px-1">
      <div className="relative h-6" dir="rtl">
        <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-border" />
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-primary"
          style={{ right: `${pct(lo)}%`, left: `${100 - pct(hi)}%` }}
        />
        <input
          type="range"
          className={thumb}
          min={min}
          max={max}
          step={step}
          value={lo}
          aria-label={labels.min}
          aria-valuetext={formatValue(lo)}
          onChange={(e) => onChange([Math.min(Number(e.target.value), hi), hi])}
        />
        <input
          type="range"
          className={thumb}
          min={min}
          max={max}
          step={step}
          value={hi}
          aria-label={labels.max}
          aria-valuetext={formatValue(hi)}
          onChange={(e) => onChange([lo, Math.max(Number(e.target.value), lo)])}
        />
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 text-xs text-text-muted">
        <span>
          {labels.min}: <b className="text-sm text-text">{formatValue(lo)}</b>
        </span>
        <span>
          {labels.max}: <b className="text-sm text-text">{formatValue(hi)}</b>
        </span>
      </div>
    </div>
  );
}
