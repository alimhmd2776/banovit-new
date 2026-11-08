import 'server-only';
import { NextResponse, type NextRequest } from 'next/server';
import { env } from '@/lib/env';

/** JSON error in the API envelope. */
export function errorResponse(status: number, code: string, message: string): NextResponse {
  return NextResponse.json({ error: { code, message } }, { status, headers: { 'Cache-Control': 'no-store' } });
}

/**
 * CSRF guard for cookie-authenticated POSTs: the request must come from our
 * own origin (Origin, or Referer when a browser omits Origin) and be JSON
 * (a cross-site <form> can't send application/json without a preflight).
 */
export function rejectCrossSite(req: NextRequest): NextResponse | null {
  if (!(req.headers.get('content-type') ?? '').toLowerCase().startsWith('application/json')) {
    return errorResponse(415, 'unsupported_media_type', 'درخواست نامعتبر است.');
  }
  const source = req.headers.get('origin') ?? req.headers.get('referer');
  if (!source) return errorResponse(403, 'forbidden', 'درخواست نامعتبر است.');
  let origin: string;
  try {
    origin = new URL(source).origin;
  } catch {
    return errorResponse(403, 'forbidden', 'درخواست نامعتبر است.');
  }
  const allowed = new Set([req.nextUrl.origin, env.siteUrl]);
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host');
  if (host) allowed.add(`${req.headers.get('x-forwarded-proto') ?? req.nextUrl.protocol.replace(':', '')}://${host}`);
  return allowed.has(origin) ? null : errorResponse(403, 'forbidden', 'درخواست نامعتبر است.');
}

export async function readJson(req: NextRequest): Promise<Record<string, unknown> | null> {
  try {
    const body = (await req.json()) as unknown;
    return body && typeof body === 'object' && !Array.isArray(body) ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/** POST/PATCH/GET to the CMS storefront API; null when the CMS can't be reached. */
export async function cms(path: string, init: { method: string; headers: Record<string, string>; body?: unknown }): Promise<Response | null> {
  return fetch(`${env.apiUrl}${path}`, {
    method: init.method,
    headers: { ...init.headers, ...(init.body !== undefined ? { 'Content-Type': 'application/json' } : {}) },
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    cache: 'no-store',
    signal: AbortSignal.timeout(15000),
  }).catch(() => null);
}

export function unavailable(): NextResponse {
  return errorResponse(502, 'unavailable', 'ارتباط برقرار نشد. لطفاً دوباره تلاش کنید.');
}

/** Relay a CMS response as is (status, JSON body, Retry-After). */
export async function relay(res: Response): Promise<NextResponse> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
  const retry = res.headers.get('retry-after');
  if (retry) headers['Retry-After'] = retry;
  return new NextResponse(res.status === 204 ? null : await res.text(), { status: res.status, headers });
}
