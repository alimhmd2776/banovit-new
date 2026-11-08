import { NextResponse } from 'next/server';
import { isNotFound, storefront } from '@/lib/api';

/** BFF: fresh price/stock for the product page (the CMS caches 10 s; this adds a 5 s CDN cache). */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const data = await storefront.getProductLive(decodeURIComponent(slug), { cache: 'no-store' });
    return NextResponse.json({ data }, { headers: { 'Cache-Control': 'public, max-age=5, s-maxage=5' } });
  } catch (e) {
    const status = isNotFound(e) ? 404 : 502;
    return NextResponse.json({ error: { code: status === 404 ? 'not_found' : 'unavailable', message: 'اطلاعات قیمت در دسترس نیست.' } }, { status });
  }
}
