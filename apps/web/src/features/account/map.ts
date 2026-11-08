/**
 * Map helpers. Tile and geocoder (Nominatim API) addresses come from the CMS
 * panel («تنظیمات حساب کاربری سایت» → نقشه), see useMapConfig().
 */

/** 3×3 slippy-map tiles around a point for static previews (no JS map). Offsets in px from the point. */
export function tilesAround(tileUrl: string, lat: number, lng: number, zoom = 16): { url: string; dx: number; dy: number }[] {
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
        url: tileUrl.replace('{z}', String(zoom)).replace('{x}', String(tx + i)).replace('{y}', String(ty + j)).replace('{s}', 'a'),
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

export async function geocode(geocoderUrl: string | null, q: string, signal?: AbortSignal): Promise<GeoResult[]> {
  if (!geocoderUrl) return [];
  const res = await fetch(`${geocoderUrl.replace(/\/$/, '')}/search?format=jsonv2&countrycodes=ir&accept-language=fa&limit=8&q=${encodeURIComponent(q)}`, { signal });
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

export async function reverseGeocode(geocoderUrl: string | null, lat: number, lng: number): Promise<ReverseResult> {
  if (!geocoderUrl) return {};
  const res = await fetch(`${geocoderUrl.replace(/\/$/, '')}/reverse?format=jsonv2&accept-language=fa&zoom=18&lat=${lat}&lon=${lng}`).catch(() => null);
  if (!res?.ok) return {};
  const j = (await res.json()) as { address?: Record<string, string> };
  const a = j.address ?? {};
  const province = (a.state ?? a.province ?? '').replace(/^استان\s*/, '') || undefined;
  const city = (a.city ?? a.town ?? a.county ?? a.village ?? '').replace(/^شهر\s*/, '') || undefined;
  const line = [a.suburb ?? a.neighbourhood, a.road, a.house_number].filter(Boolean).join('، ') || undefined;
  return { province, city, line };
}
