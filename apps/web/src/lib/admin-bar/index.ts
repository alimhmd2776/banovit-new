/**
 * «نوار مدیریت» (storefront admin bar) helpers — see docs/api/admin-bar.md.
 *
 * The panel (cms-new.banovit.com) keeps its login in its own localStorage, so
 * this site cannot see it directly. When someone signs in to the panel it
 * leaves a harmless hint cookie on the shared parent domain; only then does
 * the browser load the panel's bridge page in a hidden iframe, which checks
 * the real login and answers with edit links for the current page. Pages and
 * their cache stay identical for normal visitors (all of this is client-side).
 */
export const ADMIN_BAR_COOKIE = 'bnv_admin_bar';

export type AdminBarLink = { label: string; url: string; primary?: boolean };
export type AdminBarData = {
  user: { name: string; role_label?: string };
  panel_url: string;
  links: AdminBarLink[];
};

export function hasAdminBarHint(cookie: string): boolean {
  return cookie.split(';').some((c) => c.trim() === `${ADMIN_BAR_COOKIE}=1`);
}

/** Parent domain shared with the panel (banovit.com for new.banovit.com); null on localhost/IPs. */
export function sharedCookieDomain(hostname: string): string | null {
  if (!hostname.includes('.') || /^[\d.]+$/.test(hostname) || hostname.startsWith('[')) return null;
  return hostname.split('.').slice(-2).join('.');
}

/**
 * Panel origin: CMS_PANEL_URL when set, else derived from the site URL like the
 * deploys are named (new.banovit.com → cms-new.banovit.com, banovit.com → cms.banovit.com).
 */
export function panelOrigin(siteUrl: string, override?: string): string | null {
  const pick = (u: string) => {
    try {
      return new URL(u).origin;
    } catch {
      return null;
    }
  };
  if (override) return pick(override);
  const site = pick(siteUrl);
  if (!site) return null;
  const url = new URL(site);
  if (url.hostname === 'localhost' || /^[\d.]+$/.test(url.hostname)) return null;
  const labels = url.hostname.split('.');
  url.hostname = labels.length > 2 ? [`cms-${labels[0]}`, ...labels.slice(1)].join('.') : `cms.${url.hostname}`;
  if (labels[0] === 'www') url.hostname = `cms.${labels.slice(1).join('.')}`;
  return url.origin;
}

/** Keeps only well-formed links that point into the panel (the answer comes from another window). */
export function sanitizeAdminBar(data: unknown, origin: string): AdminBarData | null {
  if (!data || typeof data !== 'object') return null;
  const d = data as Partial<AdminBarData>;
  const inPanel = (u: unknown): u is string => typeof u === 'string' && (u === origin || u.startsWith(`${origin}/`));
  if (!d.user || typeof d.user.name !== 'string' || !inPanel(d.panel_url)) return null;
  const links = Array.isArray(d.links)
    ? d.links.filter((l): l is AdminBarLink => !!l && typeof l.label === 'string' && inPanel(l.url)).slice(0, 8)
    : [];
  return { user: { name: d.user.name, role_label: d.user.role_label }, panel_url: d.panel_url, links };
}
