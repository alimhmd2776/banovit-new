'use client';

import { IconPrinter } from './icons';

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-4 text-sm font-bold text-primary-on hover:bg-primary-hover print:hidden">
      <IconPrinter size={18} /> چاپ یا ذخیره PDF
    </button>
  );
}
