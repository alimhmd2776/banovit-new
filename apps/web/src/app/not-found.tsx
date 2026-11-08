import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-container px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-text">صفحه پیدا نشد</h1>
      <p className="mt-3 text-sm text-text-muted">آدرسی که دنبالش بودید وجود ندارد یا جابه‌جا شده است.</p>
      <Link href="/shop/" className="mt-6 inline-flex h-11 items-center rounded-sm bg-primary px-5 text-sm font-medium text-primary-on hover:bg-primary-hover">
        رفتن به فروشگاه
      </Link>
    </div>
  );
}
