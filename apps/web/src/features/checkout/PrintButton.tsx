'use client';

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="mt-6 h-11 rounded-sm bg-primary px-5 text-sm font-bold text-primary-on print:hidden">
      چاپ / ذخیره PDF
    </button>
  );
}
