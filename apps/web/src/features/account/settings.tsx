'use client';

import { createContext, useContext } from 'react';
import type { AccountSettings } from '@banovit/api-client';

/**
 * «تنظیمات حساب کاربری سایت» from the CMS panel (GET /settings/account),
 * provided once by the /my-account/ layout. Components outside that layout
 * (e.g. checkout's AddressForm) get null and use the fallbacks below.
 */
const Ctx = createContext<AccountSettings | null>(null);

export function AccountSettingsProvider({ value, children }: { value: AccountSettings | null; children: React.ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAccountSettings(): AccountSettings | null {
  return useContext(Ctx);
}

export type MapConfig = AccountSettings['map'];

/** Used only when the CMS settings are unavailable (outside /my-account/ or CMS down). */
export const FALLBACK_MAP: MapConfig = {
  tile_url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '© OpenStreetMap',
  geocoder_url: 'https://nominatim.openstreetmap.org',
  default_lat: 35.6997,
  default_lng: 51.338,
  default_zoom: 15,
};

export function useMapConfig(): MapConfig {
  return useAccountSettings()?.map ?? FALLBACK_MAP;
}

export function useSupportLimits(): { maxImages: number; maxBytes: number; maxMb: number } {
  const s = useAccountSettings()?.support;
  const maxMb = s?.max_image_mb ?? 5;
  return { maxImages: s?.max_images ?? 5, maxBytes: maxMb * 1024 * 1024, maxMb };
}
