import { NextResponse, type NextRequest } from 'next/server';
import { cms, rejectCrossSite } from '@/lib/auth/bff';
import { clearSessionCookie, customerHeaders, getSessionToken } from '@/lib/auth/session';

/** BFF: revoke the CMS token and drop the cookie (cookie is cleared even if the CMS is down). */
export async function POST(req: NextRequest) {
  const blocked = rejectCrossSite(req);
  if (blocked) return blocked;
  const token = await getSessionToken();
  if (token) await cms('/auth/logout', { method: 'POST', headers: await customerHeaders(token) });
  const out = new NextResponse(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
  clearSessionCookie(out);
  return out;
}
