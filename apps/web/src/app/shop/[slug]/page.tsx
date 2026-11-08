import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { PdpView } from '@/features/pdp/PdpView';
import { getProduct, isNotFound, movedLocation } from '@/lib/api';
import { productMetadata } from '@/lib/seo';

/**
 * /shop/{slug}/ — same URL as the WordPress product permalink. Statically
 * rendered on demand and revalidated by tag (product-slug:{slug}) when the CMS
 * changes the product; price/stock are refreshed in the browser.
 * ?attribute_pa_x= variation links are read client-side, so they share this cached HTML.
 */
export const revalidate = 3600;
export const dynamicParams = true;

type Props = { params: Promise<{ slug: string }> };

function decode(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

async function load(rawSlug: string) {
  try {
    return await getProduct(decode(rawSlug));
  } catch (e) {
    // Slug renamed in the CMS product editor: 301 to the new permalink (like WP _wp_old_slug).
    const moved = movedLocation(e);
    if (moved) permanentRedirect(moved);
    if (isNotFound(e)) notFound();
    throw e;
  }
}

export async function generateStaticParams() {
  return []; // built on first request (1500+ products), then cached
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return productMetadata(await load(slug));
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await load(slug);
  // Different casing/encoding of the same slug: 301 to the canonical permalink, like WordPress.
  if (decode(slug) !== product.slug) permanentRedirect(product.path);
  return <PdpView product={product} />;
}
