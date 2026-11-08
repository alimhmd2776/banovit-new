import type { ContactSettings } from '@banovit/api-client';

/**
 * JSON-LD for /contact-us/ (docs/03-seo-parity.md): ContactPage + the same
 * Organization node Yoast emits (@id …/#organization, so Google merges them)
 * enriched with contact points, addresses and social profiles, a LocalBusiness
 * for the primary address (phones, hours, geo) and the breadcrumb.
 */
export function contactJsonLd(s: ContactSettings, origin: string, logoUrl: string | null) {
  const url = `${origin}${s.path}`;
  const orgId = `${origin}/#organization`;
  const address = (l: ContactSettings['locations'][number]) => ({
    '@type': 'PostalAddress',
    name: l.label,
    streetAddress: l.street_address,
    addressLocality: l.locality,
    addressRegion: l.region ?? undefined,
    postalCode: l.postal_code ?? undefined,
    addressCountry: 'IR',
  });
  const primary = s.locations.find((l) => l.is_primary) ?? s.locations[0];
  const telephones = s.phones.map((p) => p.tel);
  const sameAs = s.socials.map((x) => x.url);

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ContactPage',
        '@id': `${url}#webpage`,
        url,
        name: s.seo.title,
        description: s.seo.description ?? undefined,
        inLanguage: 'fa-IR',
        isPartOf: { '@id': `${origin}/#website` },
        about: { '@id': orgId },
        breadcrumb: { '@id': `${url}#breadcrumb` },
      },
      {
        '@type': 'Organization',
        '@id': orgId,
        name: 'بانویت',
        url: `${origin}/`,
        logo: logoUrl ? { '@type': 'ImageObject', '@id': `${origin}/#/schema/logo/image/`, url: logoUrl, contentUrl: logoUrl, caption: 'بانویت' } : undefined,
        image: logoUrl ? { '@id': `${origin}/#/schema/logo/image/` } : undefined,
        email: s.email ?? undefined,
        telephone: telephones[0],
        address: s.locations.map(address),
        contactPoint: s.phones.map((p) => ({
          '@type': 'ContactPoint',
          telephone: p.tel,
          name: p.label,
          contactType: 'customer support',
          areaServed: 'IR',
          availableLanguage: 'fa',
        })),
        sameAs: sameAs.length ? sameAs : undefined,
      },
      {
        '@type': 'HomeGoodsStore',
        '@id': `${origin}/#localbusiness`,
        name: 'بانویت',
        url: `${origin}/`,
        image: logoUrl ?? undefined,
        parentOrganization: { '@id': orgId },
        telephone: telephones[0],
        email: s.email ?? undefined,
        address: primary ? address(primary) : undefined,
        geo:
          s.map.lat != null && s.map.lng != null
            ? { '@type': 'GeoCoordinates', latitude: s.map.lat, longitude: s.map.lng }
            : undefined,
        hasMap: s.map.neshan_url ?? s.map.directions_url,
        openingHoursSpecification: s.opening_hours.map((h) => ({
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: h.days.map((d) => `https://schema.org/${d}`),
          opens: h.opens,
          closes: h.closes,
        })),
        sameAs: sameAs.length ? sameAs : undefined,
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'بانویت', item: `${origin}/` },
          { '@type': 'ListItem', position: 2, name: 'تماس با ما', item: url },
        ],
      },
    ],
  };
}
