import { describe, expect, it } from 'vitest';
import { hasAdminBarHint, panelOrigin, sanitizeAdminBar, sharedCookieDomain } from './index';

describe('admin bar', () => {
  it('detects the panel hint cookie only', () => {
    expect(hasAdminBarHint('a=1; bnv_admin_bar=1; b=2')).toBe(true);
    expect(hasAdminBarHint('bnv_admin_bar=; x=1')).toBe(false);
    expect(hasAdminBarHint('')).toBe(false);
  });

  it('derives the panel origin from the site url', () => {
    expect(panelOrigin('https://new.banovit.com')).toBe('https://cms-new.banovit.com');
    expect(panelOrigin('https://banovit.com')).toBe('https://cms.banovit.com');
    expect(panelOrigin('https://www.banovit.com')).toBe('https://cms.banovit.com');
    expect(panelOrigin('http://localhost:3000')).toBeNull();
    expect(panelOrigin('https://banovit.com', 'https://cms-new.banovit.com/panel')).toBe('https://cms-new.banovit.com');
  });

  it('shares the parent domain with the panel', () => {
    expect(sharedCookieDomain('new.banovit.com')).toBe('banovit.com');
    expect(sharedCookieDomain('localhost')).toBeNull();
  });

  it('drops links that do not point into the panel', () => {
    const o = 'https://cms-new.banovit.com';
    const data = sanitizeAdminBar(
      {
        user: { name: 'علی' },
        panel_url: `${o}/panel/`,
        links: [
          { label: 'ویرایش محصول', url: `${o}/panel/products/1/edit`, primary: true },
          { label: 'بد', url: 'https://evil.example/panel' },
          { label: 'بد۲', url: 'javascript:alert(1)' },
          { label: 'بد۳', url: `${o}.evil.example/x` },
        ],
      },
      o,
    );
    expect(data?.links.map((l) => l.label)).toEqual(['ویرایش محصول']);
    expect(sanitizeAdminBar({ user: { name: 'x' }, panel_url: 'https://evil.example/' }, o)).toBeNull();
    expect(sanitizeAdminBar(null, o)).toBeNull();
  });
});
