import { NextResponse, type NextRequest } from 'next/server';
import { env } from '@/lib/env';
import { LEAD_CODE_RE } from '@/lib/tracking/cookies';
import { requestAttribution } from '@/lib/tracking/server';

export const dynamic = 'force-dynamic';

const METHODS = ['phone', 'whatsapp', 'telegram', 'bale', 'rubika', 'instagram'];

/**
 * BFF for the lead_code registry (LeadCode component): once per browser session and on
 * each phone / WhatsApp / … tap (sendBeacon). Adds the visitor's touches and GA4/Matomo
 * ids from cookies and forwards to the CMS (web_identity). Always answers 204: the
 * browser never waits on or retries this.
 */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = JSON.parse(await req.text()) as Record<string, unknown>;
  } catch {
    return new NextResponse(null, { status: 204 });
  }
  const code = String(body.lead_code ?? '').toUpperCase();
  if (!LEAD_CODE_RE.test(code)) return new NextResponse(null, { status: 204 });
  const method = typeof body.contact_method === 'string' && METHODS.includes(body.contact_method) ? body.contact_method : undefined;

  const { lead_code: _ignored, ...attribution } = await requestAttribution().catch(() => ({}) as Awaited<ReturnType<typeof requestAttribution>>);
  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? req.headers.get('x-real-ip') ?? '';
  await fetch(`${env.apiUrl}/web-identity`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-Storefront-Token': env.apiToken, 'X-Client-IP': clientIp },
    body: JSON.stringify({
      lead_code: code,
      kind: method ? 'contact_click' : 'session',
      contact_method: method,
      page: typeof body.page === 'string' ? body.page.slice(0, 500) : undefined,
      attribution,
    }),
    cache: 'no-store',
  }).catch(() => null);

  return new NextResponse(null, { status: 204 });
}
