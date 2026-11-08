/**
 * Where to go after login. Only same-site absolute paths are allowed
 * (open-redirect guard): "/cart/" yes, "//evil.com", "https://…", "/\\evil" no.
 */
export function safeRedirect(target: string | null | undefined, fallback = '/'): string {
  if (!target || typeof target !== 'string') return fallback;
  if (!target.startsWith('/') || target.startsWith('//') || target.startsWith('/\\')) return fallback;
  if (/[\u0000-\u001f]/.test(target)) return fallback;
  if (target.startsWith('/login')) return fallback;
  return target;
}

/** "/login/?redirect=/cart/" */
export function loginPath(next?: string): string {
  const to = safeRedirect(next, '');
  return to ? `/login/?redirect=${encodeURIComponent(to)}` : '/login/';
}
