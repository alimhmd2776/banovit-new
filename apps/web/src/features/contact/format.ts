import { faDigits } from '@banovit/ui';

/** 09927809601 → ۰۹۹۲۷۸۰۹۶۰۱ ; 02191014093 → ۰۲۱-۹۱۰۱۴۰۹۳ (area code split like the design). */
export function displayPhone(number: string): string {
  const digits = number.replace(/\D/g, '');
  const pretty = /^0[1-8]\d{9}$/.test(digits) ? `${digits.slice(0, 3)}-${digits.slice(3)}` : digits;
  return faDigits(pretty);
}

/** Persian/Arabic digits → Latin, everything else but digits dropped. */
export function latinDigits(value: string): string {
  return value
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/\D/g, '');
}

export function isIranMobile(value: string): boolean {
  return /^09\d{9}$/.test(latinDigits(value));
}

/** OpenStreetMap embed (no API key) centered on the pin; ~zoom-dependent bbox. */
export function osmEmbedUrl(lat: number, lng: number, zoom: number): string {
  const span = 360 / 2 ** (zoom + 1);
  const bbox = [lng - span, lat - span / 2, lng + span, lat + span / 2].map((n) => n.toFixed(5)).join(',');
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
}
