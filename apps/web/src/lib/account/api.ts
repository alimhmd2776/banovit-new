import 'server-only';
import { notFound, redirect } from 'next/navigation';
import { env } from '@/lib/env';
import { loginPath } from '@/lib/auth/redirect';
import { customerHeaders, getSessionToken } from '@/lib/auth/session';

/**
 * Server-side reads for /my-account pages (docs/api/account.md). Private,
 * never cached. 401 sends the visitor to /login/ and back; 404 is notFound().
 */
export async function accountGet<T>(path: string, nextPath: string): Promise<T> {
  const token = await getSessionToken();
  if (!token) redirect(loginPath(nextPath));
  const res = await fetch(`${env.apiUrl}/me${path}`, { headers: await customerHeaders(token), cache: 'no-store' }).catch(() => null);
  if (!res) throw new Error('CMS unreachable');
  if (res.status === 401) redirect(loginPath(nextPath));
  if (res.status === 404) notFound();
  if (!res.ok) throw new Error(`CMS ${res.status} for /me${path}`);
  return (await res.json()) as T;
}

export function qs(params: Record<string, string | number | undefined | null>): string {
  const s = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null && v !== '') s.set(k, String(v));
  const out = s.toString();
  return out ? `?${out}` : '';
}
