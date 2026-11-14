import 'server-only';
import { cookies } from 'next/headers';
import { getTrackingSettings } from '@/lib/api';
import { attributionFromCookies, type AttributionSnapshot } from './cookies';

/** The current visitor's attribution snapshot, read from the request cookies (route handlers only). */
export async function requestAttribution(): Promise<AttributionSnapshot> {
  const [jar, settings] = await Promise.all([cookies(), getTrackingSettings()]);
  return attributionFromCookies(jar.getAll(), {
    ga4MeasurementId: settings?.ga4_measurement_id,
    matomoSiteId: settings?.matomo_site_id,
  });
}
