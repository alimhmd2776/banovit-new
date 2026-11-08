import { faDigits } from '@banovit/ui';

/** Jalali dates as in the designs: «۲۷ شهریور ۱۴۰۵». */
const longDate = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Tehran' });
const numericDate = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Tehran' });
const time = new Intl.DateTimeFormat('fa-IR', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Tehran' });

function parse(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const d = new Date(iso.length === 10 ? `${iso}T12:00:00+03:30` : iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function jalaliLong(iso: string | null | undefined): string {
  const d = parse(iso);
  return d ? longDate.format(d) : '';
}

/** «۱۳۸۸/۰۱/۳۰» */
export function jalaliNumeric(iso: string | null | undefined): string {
  const d = parse(iso);
  return d ? numericDate.format(d) : '';
}

export function clock(iso: string | null | undefined): string {
  const d = parse(iso);
  return d ? time.format(d) : '';
}

/** «۱ ساعت پیش»، «دیروز»، «۱۰ مهر ۱۴۰۵». */
export function relative(iso: string | null | undefined, now = Date.now()): string {
  const d = parse(iso);
  if (!d) return '';
  const mins = Math.floor((now - d.getTime()) / 60000);
  if (mins < 1) return 'همین الان';
  if (mins < 60) return `${faDigits(mins)} دقیقه پیش`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${faDigits(hours)} ساعت پیش`;
  if (hours < 48) return 'دیروز';
  return jalaliLong(iso);
}

/** «۰۹۹۱ ۸۸۸ ۵۸۶۰» */
export function phoneDisplay(phone: string | null | undefined): string {
  if (!phone) return '';
  const p = phone.replace(/\D/g, '');
  return faDigits(p.length === 11 ? `${p.slice(0, 4)} ${p.slice(4, 7)} ${p.slice(7)}` : p);
}

/** CMS attachment URL → same-origin BFF URL. */
export function attachmentUrl(cmsUrl: string): string {
  const i = cmsUrl.indexOf('/me/tickets/');
  return i >= 0 ? `/api${cmsUrl.slice(i)}/` : cmsUrl;
}

/** «مبلغ پرداخت شده» only once the order is paid; unpaid (e.g. card-to-card awaiting review) shows «مبلغ سفارش». */
export function amountLabel(order: { steps: { key: string; state: string }[] }): string {
  return order.steps.some((s) => s.key === 'paid' && s.state !== 'done') ? 'مبلغ سفارش' : 'مبلغ پرداخت شده';
}
