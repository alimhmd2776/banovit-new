import { describe, expect, it } from 'vitest';
import { AUTH_TEXT_DEFAULTS, fill } from './links';

describe('login texts', () => {
  it('fills placeholders and keeps unknown ones', () => {
    expect(fill(AUTH_TEXT_DEFAULTS.code_subtitle, { phone: '۰۹۱۲' })).toBe('کد پیامکی برای شماره (۰۹۱۲) ارسال گردید');
    expect(fill('{time} / {x}', { time: '۱:۰۰' })).toBe('۱:۰۰ / {x}');
  });
});
