import { NextResponse, type NextRequest } from 'next/server';
import { env } from '@/lib/env';

/**
 * BFF for the post view counter: POST {slug}. Forwards with the internal token
 * and the visitor IP; the CMS counts one view per IP and post per 30 minutes.
 */
export async function POST(req: NextRequest) {
  let slug = '';
  try {
    slug = String(((await req.json()) as { slug?: unknown }).slug ?? '');
  } catch {
    /* empty body */
  }
  if (!slug || slug.length > 300) {
    return NextResponse.json({ error: { code: 'bad_request', message: 'درخواست نامعتبر است.' } }, { status: 400 });
  }
  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? req.headers.get('x-real-ip') ?? '';
  const res = await fetch(`${env.apiUrl}/blog/posts/${encodeURIComponent(slug)}/views`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'X-Storefront-Token': env.apiToken, 'X-Client-IP': clientIp },
    cache: 'no-store',
  }).catch(() => null);
  return new NextResponse(null, { status: res?.status === 202 ? 202 : 204 });
}
