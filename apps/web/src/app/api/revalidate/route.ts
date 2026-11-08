import { createHmac, timingSafeEqual } from 'node:crypto';
import { revalidateTag } from 'next/cache';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Tag revalidation hook for the CMS (docs/01-architecture.md): POST {"tags": [...]}
 * signed with X-Signature: hex(HMAC-SHA256(body, REVALIDATE_SECRET)).
 */
export async function POST(req: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET ?? '';
  const body = await req.text();
  const given = Buffer.from(req.headers.get('x-signature') ?? '', 'hex');
  const expected = createHmac('sha256', secret).update(body).digest();
  if (!secret || given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return NextResponse.json({ error: { code: 'forbidden', message: 'invalid signature' } }, { status: 403 });
  }

  let tags: unknown;
  try {
    tags = (JSON.parse(body) as { tags?: unknown }).tags;
  } catch {
    tags = null;
  }
  if (!Array.isArray(tags) || tags.length === 0 || tags.length > 100 || !tags.every((t) => typeof t === 'string' && t.length <= 200)) {
    return NextResponse.json({ error: { code: 'bad_request', message: 'tags must be 1-100 strings' } }, { status: 422 });
  }
  for (const tag of tags as string[]) revalidateTag(tag);
  return NextResponse.json({ data: { revalidated: tags } });
}
