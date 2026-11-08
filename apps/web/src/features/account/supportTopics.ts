import type { AccountSettings } from '@banovit/api-client';
import { getAccountSettings } from '@/lib/api';

/**
 * «پشتیبانی بانویت» help topics (designs 28–30), edited in the CMS panel under
 * «تنظیمات حساب کاربری سایت». Only enabled topics come back from the API;
 * `needs_order` topics ask the customer to pick an order before the report form.
 */
export type SupportTopic = AccountSettings['support']['topics'][number];

export async function supportSettings(): Promise<AccountSettings['support'] | null> {
  return (await getAccountSettings().catch(() => null))?.support ?? null;
}

export async function supportTopic(key: string | undefined): Promise<SupportTopic | undefined> {
  if (!key) return undefined;
  return (await supportSettings())?.topics.find((t) => t.key === key);
}
