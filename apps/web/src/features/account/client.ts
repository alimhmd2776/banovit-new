'use client';

/**
 * Browser-side calls for the account area: always the BFF (/api/me/…/), never
 * the CMS. Throws AccountError with the API's Persian message.
 */
import { doneNavProgress, startNavProgress } from '@/lib/nav-progress';

export class AccountError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly fields?: Record<string, string[]>,
  ) {
    super(message);
  }
}

export async function me<T = unknown>(method: string, path: string, body?: unknown): Promise<T> {
  // Saves/deletes show the top progress bar (reads may be background polls).
  const visible = method.toUpperCase() !== 'GET';
  if (visible) startNavProgress();
  try {
    return await call<T>(method, path, body);
  } finally {
    if (visible) doneNavProgress();
  }
}

async function call<T>(method: string, path: string, body: unknown): Promise<T> {
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
  let res: Response;
  try {
    res = await fetch(`/api/me/${path.replace(/^\/|\/$/g, '')}/`, {
      method,
      headers: { Accept: 'application/json', ...(body !== undefined && !isForm ? { 'Content-Type': 'application/json' } : {}) },
      body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
      cache: 'no-store',
      credentials: 'same-origin',
    });
  } catch {
    throw new AccountError(0, 'network', 'اتصال اینترنت را بررسی کنید و دوباره تلاش کنید.');
  }
  if (res.status === 204) return undefined as T;
  const json = (await res.json().catch(() => null)) as { data?: T; error?: { code: string; message: string; fields?: Record<string, string[]> } } | null;
  if (!res.ok) {
    if (res.status === 401) {
      window.location.href = `/login/?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
    }
    if (res.status === 429) throw new AccountError(429, 'rate_limited', 'درخواست‌ها زیاد شد؛ چند ثانیه صبر کنید.');
    throw new AccountError(res.status, json?.error?.code ?? 'error', json?.error?.message ?? 'خطایی رخ داد. دوباره تلاش کنید.', json?.error?.fields);
  }
  return (json?.data ?? (json as T)) as T;
}

export function firstFieldError(e: unknown, field: string): string | undefined {
  return e instanceof AccountError ? e.fields?.[field]?.[0] : undefined;
}

/** PDP hook (thread PDP calls the BFF directly; this is the same call for reuse). */
export function trackProductView(slug: string): void {
  void fetch('/api/me/recently-viewed/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ product_slug: slug }),
    credentials: 'same-origin',
    keepalive: true,
  }).catch(() => undefined);
}
