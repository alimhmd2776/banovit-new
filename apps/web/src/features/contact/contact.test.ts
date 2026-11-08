import { describe, expect, it } from 'vitest';
import type { ContactSettings } from '@banovit/api-client';
import { displayPhone, isIranMobile, latinDigits, osmEmbedUrl } from './format';
import { contactJsonLd } from './schema';

const settings: ContactSettings = {
  path: '/contact-us/',
  heading: 'پشتیبانی بانویت',
  intro: 'تیم حرفه‌ای بانویت حاضر به خدمت به مشتریان است.',
  hours_title: 'ساعت پاسخگویی: ۸ صبح الی ۶ عصر',
  hours_note: null,
  opening_hours: [{ days: ['Saturday', 'Sunday'], opens: '09:00', closes: '17:00' }],
  phones: [
    { label: 'پشتیبانی', number: '09927809601', tel: '+989927809601' },
    { label: 'دفتر', number: '02191014093', tel: '+982191014093' },
  ],
  email: null,
  locations: [
    { label: 'آدرس انبار بانویت', street_address: 'سرای گوهردشت', locality: 'کرج', region: 'البرز', postal_code: null, icon: 'warehouse', is_primary: false, display: 'کرج، سرای گوهردشت' },
    { label: 'آدرس شرکت', street_address: 'کارخانه نوآوری آزادی', locality: 'تهران', region: 'تهران', postal_code: null, icon: 'office', is_primary: true, display: 'تهران، کارخانه نوآوری آزادی' },
  ],
  map: { lat: 35.7, lng: 51.3, zoom: 16, pin_label: 'بانویت', image: null, neshan_url: null, directions_url: 'https://www.google.com/maps/dir/?api=1&destination=35.7,51.3' },
  form: { title: 'درخواست مشاوره', message_placeholder: null, submit_label: 'ارسال درخواست', success_message: 'ثبت شد' },
  socials: [{ network: 'instagram', url: 'https://instagram.com/banovit' }],
  seo: { title: 'تماس با ما - بانویت', description: null, canonical: 'https://banovit.com/contact-us/', robots: 'index, follow', og_title: null, og_description: null, og_image: null },
};

describe('contact format helpers', () => {
  it('formats mobiles and landlines like the design', () => {
    expect(displayPhone('09927809601')).toBe('۰۹۹۲۷۸۰۹۶۰۱');
    expect(displayPhone('02191014093')).toBe('۰۲۱-۹۱۰۱۴۰۹۳');
  });
  it('accepts Persian digits and spaces in mobiles', () => {
    expect(latinDigits('۰۹۱۲ ۳۴۵ ۶۷۸۹')).toBe('09123456789');
    expect(isIranMobile('۰۹۱۲۳۴۵۶۷۸۹')).toBe(true);
    expect(isIranMobile('02191014093')).toBe(false);
  });
  it('builds an OSM embed centered on the pin', () => {
    expect(osmEmbedUrl(35.7, 51.3, 16)).toContain('marker=35.7,51.3');
  });
});

describe('contactJsonLd', () => {
  const ld = contactJsonLd(settings, 'https://banovit.com', 'https://banovit.com/logo.png');
  const byType = (t: string) => ld['@graph'].find((n) => n['@type'] === t) as Record<string, any>;

  it('reuses the Yoast organization @id and adds contact points and profiles', () => {
    const org = byType('Organization');
    expect(org['@id']).toBe('https://banovit.com/#organization');
    expect(org.contactPoint).toHaveLength(2);
    expect(org.sameAs).toEqual(['https://instagram.com/banovit']);
  });
  it('puts the primary address, hours and geo on the LocalBusiness', () => {
    const lb = byType('HomeGoodsStore');
    expect(lb.address.addressLocality).toBe('تهران');
    expect(lb.address.addressCountry).toBe('IR');
    expect(lb.telephone).toBe('+989927809601');
    expect(lb.geo).toEqual({ '@type': 'GeoCoordinates', latitude: 35.7, longitude: 51.3 });
    expect(lb.openingHoursSpecification[0].dayOfWeek).toEqual(['https://schema.org/Saturday', 'https://schema.org/Sunday']);
  });
  it('has a ContactPage with a breadcrumb', () => {
    expect(byType('ContactPage').url).toBe('https://banovit.com/contact-us/');
    expect(byType('BreadcrumbList').itemListElement).toHaveLength(2);
  });
});
