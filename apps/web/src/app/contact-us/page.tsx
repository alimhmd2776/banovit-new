import type { Metadata } from 'next';
import { ContactView } from '@/features/contact/ContactView';
import { contactJsonLd } from '@/features/contact/schema';
import { getContactSettings } from '@/lib/api';
import { env } from '@/lib/env';
import { jsonLdScript, pageMetadata } from '@/lib/seo';

/**
 * /contact-us/ — same URL as the WordPress page (docs/03-seo-parity.md).
 * Content, head tags and schema come from the CMS (admin: «صفحه تماس با ما»).
 */
// Rendered on request (the CMS is not reachable at image build time); the CMS
// data itself is cached 300s via fetch tags (lib/api) and the HTML by the CDN.
export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const s = await getContactSettings();
  return pageMetadata({ seo: s.seo, path: s.path, ogType: s.seo.og_type === 'article' ? 'article' : 'website' });
}

export default async function ContactUsPage() {
  const s = await getContactSettings();
  return (
    <>
      {/* Live parity: the CMS holds the live JSON-LD blocks verbatim; generated only when it has none. */}
      {(s.seo.json_ld?.length ? s.seo.json_ld : [contactJsonLd(s, env.canonicalOrigin, s.logo?.url ?? null)]).map((block, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(block)} />
      ))}
      <ContactView s={s} />
    </>
  );
}
