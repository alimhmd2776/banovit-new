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
export const revalidate = 300;

/** Same logo Yoast publishes in the Organization node, until media moves to object storage. */
const LOGO_URL = 'https://banovit.com/wp-content/uploads/2024/07/Logo-2.png';

export async function generateMetadata(): Promise<Metadata> {
  const s = await getContactSettings();
  return pageMetadata({ seo: s.seo, path: s.path });
}

export default async function ContactUsPage() {
  const s = await getContactSettings();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(contactJsonLd(s, env.canonicalOrigin, LOGO_URL))} />
      <ContactView s={s} />
    </>
  );
}
