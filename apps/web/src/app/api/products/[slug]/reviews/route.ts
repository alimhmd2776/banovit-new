import { NextResponse, type NextRequest } from 'next/server';
import { env } from '@/lib/env';

function cmsUrl(slug: string, suffix = ''): string {
  return `${env.apiUrl}/products/${encodeURIComponent(decodeURIComponent(slug))}/reviews${suffix}`;
}

/** BFF: more approved reviews ("نمایش دیدگاه‌های بیشتر"). */
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = Math.max(1, Math.min(500, Number(req.nextUrl.searchParams.get('page')) || 1));
  const res = await fetch(cmsUrl(slug, page > 1 ? `?page=${page}` : ''), {
    headers: { Accept: 'application/json', 'X-Storefront-Token': env.apiToken },
    next: { revalidate: 300, tags: ['reviews'] },
  }).catch(() => null);
  if (!res) return NextResponse.json({ error: { code: 'unavailable', message: 'ارتباط برقرار نشد.' } }, { status: 502 });
  return new NextResponse(await res.text(), {
    status: res.status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=60, s-maxage=300' },
  });
}

/** BFF: new review, forwarded with the internal token and the visitor IP (per-visitor rate limit in the CMS). */
export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: { code: 'bad_request', message: 'درخواست نامعتبر است.' } }, { status: 400 });
  }
  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? req.headers.get('x-real-ip') ?? '';
  const res = await fetch(cmsUrl(slug), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-Storefront-Token': env.apiToken, 'X-Client-IP': clientIp },
    body: JSON.stringify({
      author_name: String(body.author_name ?? '').slice(0, 100),
      phone: body.phone ? String(body.phone).slice(0, 20) : undefined,
      rating: Number(body.rating) || 0,
      body: String(body.body ?? '').slice(0, 3000),
      variation_id: typeof body.variation_id === 'number' ? body.variation_id : null,
    }),
    cache: 'no-store',
  }).catch(() => null);
  if (!res) return NextResponse.json({ error: { code: 'unavailable', message: 'ارتباط برقرار نشد. لطفاً دوباره تلاش کنید.' } }, { status: 502 });
  return new NextResponse(await res.text(), { status: res.status, headers: { 'Content-Type': 'application/json' } });
}
