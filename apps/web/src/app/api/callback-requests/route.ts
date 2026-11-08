import { NextResponse, type NextRequest } from 'next/server';
import { env } from '@/lib/env';

/**
 * BFF for the support callback form: forwards to the CMS with the internal
 * token and the visitor IP (the CMS rate-limits per visitor, not per server).
 */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: { code: 'bad_request', message: 'درخواست نامعتبر است.' } }, { status: 400 });
  }

  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? req.headers.get('x-real-ip') ?? '';
  const res = await fetch(`${env.apiUrl}/callback-requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Storefront-Token': env.apiToken,
      'X-Client-IP': clientIp,
    },
    body: JSON.stringify({
      phone: String(body.phone ?? ''),
      page_url: String(body.page_url ?? '').slice(0, 500),
      page_title: String(body.page_title ?? '').slice(0, 200),
    }),
    cache: 'no-store',
  }).catch(() => null);

  if (!res) {
    return NextResponse.json({ error: { code: 'unavailable', message: 'ارتباط برقرار نشد. لطفاً دوباره تلاش کنید.' } }, { status: 502 });
  }
  return new NextResponse(await res.text(), { status: res.status, headers: { 'Content-Type': 'application/json' } });
}
