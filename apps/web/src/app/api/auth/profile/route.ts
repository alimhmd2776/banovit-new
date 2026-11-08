import type { NextRequest } from 'next/server';
import { cms, errorResponse, readJson, rejectCrossSite, relay, unavailable } from '@/lib/auth/bff';
import { customerHeaders, getSessionToken } from '@/lib/auth/session';

/** BFF: signup name step → CMS PATCH /me. */
export async function POST(req: NextRequest) {
  const blocked = rejectCrossSite(req);
  if (blocked) return blocked;
  const token = await getSessionToken();
  if (!token) return errorResponse(401, 'unauthenticated', 'لطفاً دوباره وارد شوید.');
  const body = await readJson(req);
  if (!body) return errorResponse(400, 'bad_request', 'درخواست نامعتبر است.');

  const res = await cms('/me', {
    method: 'PATCH',
    headers: await customerHeaders(token),
    body: { first_name: String(body.first_name ?? '').slice(0, 60), last_name: String(body.last_name ?? '').slice(0, 60) },
  });
  return res ? relay(res) : unavailable();
}
