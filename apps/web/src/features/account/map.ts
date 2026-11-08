/**
 * Map config. Tiles and geocoding are OpenStreetMap by default and can be
 * pointed at an Iranian provider (Neshan/Parsimap/self-hosted) with
 * NEXT_PUBLIC_MAP_TILE_URL and NEXT_PUBLIC_GEOCODER_URL (Nominatim API).
 */
export const TILE_URL = process.env.NEXT_PUBLIC_MAP_TILE_URL ?? 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
export const GEOCODER_URL = (process.env.NEXT_PUBLIC_GEOCODER_URL ?? 'https://nominatim.openstreetmap.org').replace(/\/$/, '');
export const TILE_ATTRIBUTION = '© OpenStreetMap';

/** 3×3 slippy-map tiles around a point for static previews (no JS map). Offsets in px from the point. */
export function tilesAround(lat: number, lng: number, zoom = 16): { url: string; dx: number; dy: number }[] {
  const n = 2 ** zoom;
  const x = ((lng + 180) / 360) * n;
  const latRad = (lat * Math.PI) / 180;
  const y = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n;
  const tx = Math.floor(x);
  const ty = Math.floor(y);
  const out: { url: string; dx: number; dy: number }[] = [];
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      out.push({
        url: TILE_URL.replace('{z}', String(zoom)).replace('{x}', String(tx + i)).replace('{y}', String(ty + j)).replace('{s}', 'a'),
        dx: Math.round((tx + i - x) * 256),
        dy: Math.round((ty + j - y) * 256),
      });
    }
  }
  return out;
}

export interface GeoResult {
  lat: number;
  lng: number;
  title: string;
  subtitle: string;
}

export async function geocode(q: string, signal?: AbortSignal): Promise<GeoResult[]> {
  const res = await fetch(`${GEOCODER_URL}/search?format=jsonv2&countrycodes=ir&accept-language=fa&limit=8&q=${encodeURIComponent(q)}`, { signal });
  if (!res.ok) return [];
  const rows = (await res.json()) as { lat: string; lon: string; name?: string; display_name: string }[];
  return rows.map((r) => {
    const parts = r.display_name.split('،').map((s) => s.trim());
    return { lat: Number(r.lat), lng: Number(r.lon), title: r.name || parts[0] || r.display_name, subtitle: parts.slice(1, 4).join('، ') };
  });
}

export interface ReverseResult {
  province?: string;
  city?: string;
  line?: string;
}

export async function reverseGeocode(lat: number, lng: number): Promise<ReverseResult> {
  const res = await fetch(`${GEOCODER_URL}/reverse?format=jsonv2&accept-language=fa&zoom=18&lat=${lat}&lon=${lng}`).catch(() => null);
  if (!res?.ok) return {};
  const j = (await res.json()) as { address?: Record<string, string> };
  const a = j.address ?? {};
  const province = (a.state ?? a.province ?? '').replace(/^استان\s*/, '') || undefined;
  const city = (a.city ?? a.town ?? a.county ?? a.village ?? '').replace(/^شهر\s*/, '') || undefined;
  const line = [a.suburb ?? a.neighbourhood, a.road, a.house_number].filter(Boolean).join('، ') || undefined;
  return { province, city, line };
}
