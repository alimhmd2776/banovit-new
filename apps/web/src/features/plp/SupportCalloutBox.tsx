import { getContactSettings, getListingSettings } from '@/lib/api';
import { SupportCalloutForm } from './SupportCallout';

/**
 * «آیا نیاز به تیم پشتیبانی دارید؟» box (PLP, PDP …). Texts come from «صفحه فروشگاه و فوتر»,
 * the phone from «صفحه تماس با ما». Hidden when switched off in the panel or the CMS is down.
 */
export async function SupportCallout({ pageTitle }: { pageTitle: string; phone?: string; phoneDisplay?: string }) {
  const [settings, contact] = await Promise.all([getListingSettings(), getContactSettings().catch(() => null)]);
  if (!settings?.support_box.enabled) return null;
  return <SupportCalloutForm box={settings.support_box} phone={contact?.phones[0] ?? null} pageTitle={pageTitle} />;
}
