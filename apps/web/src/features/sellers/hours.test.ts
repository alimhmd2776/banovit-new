import { describe, expect, it } from 'vitest';
import type { OpeningDay } from '@banovit/api-client';
import { openStatus, rangesLabel, tehranClock } from './hours';

const days: OpeningDay[] = [
  { day: 'sat', label: 'شنبه', ranges: [{ open: '08:00', close: '23:00' }] },
  { day: 'fri', label: 'جمعه', ranges: [] },
];

describe('seller opening hours', () => {
  it('reads the clock in Tehran time, not the viewer timezone', () => {
    // 2026-11-07 (Saturday) 05:00 UTC = 08:30 Tehran (+03:30)
    expect(tehranClock(new Date('2026-11-07T05:00:00Z'))).toEqual({ day: 'sat', time: '08:30' });
    // Friday 21:00 UTC = Saturday 00:30 Tehran
    expect(tehranClock(new Date('2026-11-06T21:00:00Z')).day).toBe('sat');
  });

  it('open inside a range, closed outside it and on closed days', () => {
    expect(openStatus(days, new Date('2026-11-07T05:00:00Z')).isOpen).toBe(true);
    expect(openStatus(days, new Date('2026-11-07T03:00:00Z')).isOpen).toBe(false); // 06:30
    expect(openStatus(days, new Date('2026-11-06T10:00:00Z'))).toMatchObject({ isOpen: false, today: { day: 'fri' } });
    expect(openStatus(days, new Date('2026-11-08T10:00:00Z'))).toEqual({ isOpen: null, today: null }); // Sunday: no data
  });

  it('labels ranges', () => {
    expect(rangesLabel(days[0]!, (s) => s)).toBe('08:00 تا 23:00');
    expect(rangesLabel(days[1]!, (s) => s)).toBeNull();
  });
});
