import Link from 'next/link';

/** Placeholder until the home page design arrives (home thread owns this file). */
export default function Home() {
  return (
    <div className="mx-auto max-w-container px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-text">بانویت</h1>
      <Link href="/shop/" className="mt-6 inline-flex h-11 items-center rounded-sm bg-primary px-5 text-sm font-medium text-primary-on">
        فروشگاه
      </Link>
    </div>
  );
}
