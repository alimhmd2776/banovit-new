/** UI number/money formatting. API money is integer rial; the UI shows toman with Persian digits. */

const faNumber = new Intl.NumberFormat('fa-IR');

export function faDigits(n: number | string): string {
  return typeof n === 'number' ? faNumber.format(n) : n.replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]!);
}

export function rialToToman(rial: number): number {
  return Math.round(rial / 10);
}

/** 12_500_000 rial -> "۱٬۲۵۰٬۰۰۰" */
export function formatToman(rial: number): string {
  return faNumber.format(rialToToman(rial));
}

export function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
