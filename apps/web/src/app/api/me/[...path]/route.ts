import { NextResponse, type NextRequest } from 'next/server';
import { env } from '@/lib/env';
import { errorResponse, rejectCrossSite, relay, unavailable } from '@/lib/auth/bff';
import { customerHeaders, getSessionToken } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

/**
 * BFF for the signed-in customer area: /api/me/<path>/ → CMS /me/<path>.
 * The browser never sees the Sanctum token (httpOnly bnv_session cookie).
 * Only the paths below are forwarded. Mutations must be same-origin JSON,
 * except ticket endpoints, which take multipart (same-origin check only).
 */
const ALLOWED: [RegExp, string[]][] = [
  [/^summary$/, ['GET']],
  [/^profile$/, ['GET', 'PATCH']],
  [/^orders(\/[\w-]+)?$/, ['GET']],
  [/^addresses$/, ['GET', 'POST']],
  [/^addresses\/[0-9A-Za-z]{26}$/, ['PATCH', 'DELETE']],
  [/^wishlist(\/slugs)?$/, ['GET']],
  [/^wishlist\/settings$/, ['PATCH']],
  [/^wishlist\/[^/]+$/, ['PUT', 'DELETE']],
  [/^recently-viewed$/, ['GET', 'POST', 'DELETE']],
  [/^reviews$/, ['GET', 'POST']],
  [/^notifications$/, ['GET', 'DELETE']],
  [/^notifications\/read$/, ['POST']],
  [/^tickets$/, ['GET', 'POST']],
  [/^tickets\/[0-9A-Za-z]{26}$/, ['GET']],
  [/^tickets\/[0-9A-Za-z]{26}\/messages$/, ['POST']],
  [/^tickets\/[0-9A-Za-z]{26}\/attachments\/\d+\/\d+$/, ['GET']],
];

const MULTIPART = /^tickets(\/[0-9A-Za-z]{26}\/messages)?$/;
const MAX_UPLOAD = 26 * 1024 * 1024;

type Ctx = { params: Promise<{ path: string[] }> };

async function handle(req: NextRequest, ctx: Ctx): Promise<NextResponse> {
  const segments = (await ctx.params).path.map((s) => decodeURIComponent(s));
  const path = segments.join('/');
  const method = req.method.toUpperCase();
  const rule = ALLOWED.find(([re]) => re.test(path));
  if (!rule) return errorResponse(404, 'not_found', 'یافت نشد.');
  if (!rule[1].includes(method)) return errorResponse(405, 'method_not_allowed', 'درخواست نامعتبر است.');

  const multipart = method === 'POST' && MULTIPART.test(path) && (req.headers.get('content-type') ?? '').startsWith('multipart/form-data');
  if (method !== 'GET') {
    const blocked = multipart ? rejectCrossSiteOrigin(req) : method === 'DELETE' || method === 'PUT' ? rejectCrossSiteOrigin(req) : rejectCrossSite(req);
    if (blocked) return blocked;
  }

  const token = await getSessionToken();
  if (!token) return errorResponse(401, 'unauthenticated', 'لطفاً دوباره وارد شوید.');

  const headers = await customerHeaders(token);
  let body: BodyInit | undefined;
  if (multipart) {
    const len = Number(req.headers.get('content-length') ?? 0);
    if (len > MAX_UPLOAD) return errorResponse(413, 'too_large', 'حجم فایل‌ها زیاد است.');
    body = await req.formData();
  } else if (method !== 'GET' && method !== 'DELETE') {
    body = await req.text();
    headers['Content-Type'] = 'application/json';
  }

  const target = `${env.apiUrl}/me/${segments.map(encodeURIComponent).join('/')}${req.nextUrl.search}`;
  const res = await fetch(target, { method, headers, body, cache: 'no-store', signal: AbortSignal.timeout(30000) }).catch(() => null);
  if (!res) return unavailable();

  // Ticket attachments are files, not JSON.
  if (path.includes('/attachments/') && res.ok) {
    return new NextResponse(res.body, {
      status: 200,
      headers: {
        'Content-Type': res.headers.get('content-type') ?? 'application/octet-stream',
        'Cache-Control': 'private, max-age=3600',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  }
  return relay(res);
}

/** Same-origin check without the JSON content-type requirement (multipart, DELETE, PUT without body). */
function rejectCrossSiteOrigin(req: NextRequest): NextResponse | null {
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

export { handle as GET, handle as POST, handle as PATCH, handle as PUT, handle as DELETE };
