const LOCAL_DIGITS: Record<string, string> = {
  '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4', '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
  '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4', '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
};

/** Persian/Arabic digits → Latin, everything else dropped. */
export function toLatinDigits(value: string): string {
  return value.replace(/[۰-۹٠-٩]/g, (d) => LOCAL_DIGITS[d] ?? d).replace(/\D+/g, '');
}

/** Same rules as the CMS (App\Support\Phone): 09XXXXXXXXX or null. */
export function normalizeMobile(raw: string): string | null {
  let d = toLatinDigits(raw);
  if (d.startsWith('0098')) d = d.slice(4);
  else if (d.startsWith('98') && d.length === 12) d = d.slice(2);
  if (d.startsWith('9') && d.length === 10) d = `0${d}`;
  return /^09\d{9}$/.test(d) ? d : null;
}

export function toPersianDigits(value: string | number): string {
  return String(value).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]!);
}
