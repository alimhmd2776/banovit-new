import type { OpeningDay } from '@banovit/api-client';

/** JS getDay() (0 = Sunday) -> API day key. */
const JS_DAY = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

export type OpenStatus = {
  /** null when the seller has no hours for today */
  isOpen: boolean | null;
  today: OpeningDay | null;
};

/** Weekday and HH:MM in Tehran for a given instant (independent of the viewer's timezone). */
export function tehranClock(now: Date): { day: (typeof JS_DAY)[number]; time: string } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Tehran',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  const day = get('weekday').toLowerCase().slice(0, 3) as (typeof JS_DAY)[number];
  return { day: JS_DAY.includes(day) ? day : JS_DAY[now.getUTCDay()]!, time: `${get('hour')}:${get('minute')}` };
}

/** Open/closed right now. Computed in the browser because the page HTML is cached. */
export function openStatus(days: OpeningDay[], now: Date): OpenStatus {
  const { day, time } = tehranClock(now);
  const today = days.find((d) => d.day === day) ?? null;
  if (!today) return { isOpen: null, today: null };
  const isOpen = today.ranges.some((r) => r.open <= time && time < r.close);
  return { isOpen, today };
}

/** «۰۸:۰۰ تا ۲۳:۰۰» (several ranges joined with «،») or null when closed. */
export function rangesLabel(day: OpeningDay, digits: (s: string) => string): string | null {
  if (!day.ranges.length) return null;
  return day.ranges.map((r) => `${digits(r.open)} تا ${digits(r.close)}`).join('، ');
}
