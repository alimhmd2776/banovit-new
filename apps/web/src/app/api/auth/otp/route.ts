import type { NextRequest } from 'next/server';
import { cms, readJson, rejectCrossSite, relay, unavailable, errorResponse } from '@/lib/auth/bff';
import { clientIpFrom } from '@/lib/auth/session';
import { env } from '@/lib/env';

/** BFF: ask the CMS to text a login code. Limits are enforced by the CMS per number and per visitor IP. */
export async function POST(req: NextRequest) {
  const blocked = rejectCrossSite(req);
  if (blocked) return blocked;
  const body = await readJson(req);
  if (!body) return errorResponse(400, 'bad_request', 'درخواست نامعتبر است.');

  const res = await cms('/auth/otp', {
    method: 'POST',
    headers: { Accept: 'application/json', 'X-Storefront-Token': env.apiToken, 'X-Client-IP': clientIpFrom(req.headers) },
    body: { phone: String(body.phone ?? '').slice(0, 30) },
  });
  return res ? relay(res) : unavailable();
}
