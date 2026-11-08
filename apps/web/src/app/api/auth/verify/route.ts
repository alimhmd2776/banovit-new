import { NextResponse, type NextRequest } from 'next/server';
import type { CustomerSession } from '@banovit/api-client';
import { cms, errorResponse, readJson, rejectCrossSite, relay, unavailable } from '@/lib/auth/bff';
import { mergeGuestCartOnLogin } from '@/lib/auth/hooks';
import { clientIpFrom, setSessionCookie } from '@/lib/auth/session';
import { env } from '@/lib/env';

/**
 * BFF: check the code. On success the CMS token goes into the httpOnly
 * session cookie and the browser only gets {is_new, customer}.
 */
export async function POST(req: NextRequest) {
  const blocked = rejectCrossSite(req);
  if (blocked) return blocked;
  const body = await readJson(req);
  if (!body) return errorResponse(400, 'bad_request', 'درخواست نامعتبر است.');

  const ip = clientIpFrom(req.headers);
  const res = await cms('/auth/otp/verify', {
    method: 'POST',
    headers: { Accept: 'application/json', 'X-Storefront-Token': env.apiToken, 'X-Client-IP': ip },
    body: { phone: String(body.phone ?? '').slice(0, 30), code: String(body.code ?? '').slice(0, 10) },
  });
  if (!res) return unavailable();
  if (!res.ok) return relay(res);

  const session = ((await res.json()) as { data: CustomerSession }).data;
  const out = NextResponse.json(
    { data: { is_new: session.is_new, customer: session.customer } },
    { headers: { 'Cache-Control': 'no-store' } },
  );
  setSessionCookie(out, session.token, session.expires_at);
  await mergeGuestCartOnLogin(req, out, session.token, ip);
  return out;
}
