import Link from 'next/link';

/** Shown when the cart API cannot be reached on first render. */
export function CartUnavailable() {
  return (
    <section className="mx-auto max-w-md px-6 py-20 text-center">
      <h1 className="text-base font-bold text-text">سبد خرید در دسترس نیست</h1>
      <p className="mt-2 text-sm text-text-muted">ارتباط با فروشگاه برقرار نشد. چند لحظه دیگر صفحه را دوباره باز کنید.</p>
      <Link href="/cart/" className="mt-5 inline-flex h-11 items-center rounded-sm bg-primary px-5 text-sm font-bold text-primary-on">
        تلاش دوباره
      </Link>
    </section>
  );
}
