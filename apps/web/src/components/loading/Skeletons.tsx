/**
 * Grey placeholder layouts shown by the route `loading.tsx` files while the
 * next page is fetched, so a click never leaves the old page frozen or a
 * blank screen. Shapes follow the real views (PlpView, PdpView, …) loosely.
 */
function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(' ');
}

export function Bone({ className }: { className?: string }) {
  return <span aria-hidden className={cx('block animate-pulse rounded-sm bg-surface-muted', className)} />;
}

function Shell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div role="status" aria-live="polite" aria-busy="true" className={cx('mx-auto max-w-container px-4 pb-24 pt-3 lg:pb-16 lg:pt-6', className)}>
      <span className="sr-only">در حال بارگذاری…</span>
      {children}
    </div>
  );
}

function Lines({ n = 3 }: { n?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: n }, (_, i) => (
        <Bone key={i} className={cx('h-3', i === n - 1 ? 'w-2/3' : 'w-full')} />
      ))}
    </div>
  );
}

/** Generic page: title + a few blocks. */
export function PageSkeleton() {
  return (
    <Shell className="space-y-5">
      <Bone className="h-4 w-40" />
      <Bone className="h-7 w-2/3 lg:w-1/3" />
      <Lines n={4} />
      <Bone className="h-48 w-full rounded-md" />
      <Lines n={3} />
    </Shell>
  );
}

function ProductRow() {
  return (
    <li className="flex gap-3 py-3 lg:flex-col lg:rounded-md lg:border lg:border-border lg:p-3">
      <Bone className="size-28 shrink-0 rounded-md lg:aspect-square lg:size-auto lg:w-full" />
      <div className="flex-1 space-y-2 pt-1">
        <Bone className="h-3.5 w-full" />
        <Bone className="h-3.5 w-3/4" />
        <Bone className="mt-4 h-4 w-1/3" />
      </div>
    </li>
  );
}

/** Category / brand / seller / shop listing. */
export function ListingSkeleton() {
  return (
    <Shell className="space-y-4 lg:space-y-6">
      <Bone className="h-3 w-48" />
      <Bone className="h-7 w-1/2 lg:w-1/4" />
      <div className="lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start lg:gap-6">
        <div className="hidden space-y-3 rounded-md border border-border p-4 lg:block">
          {Array.from({ length: 6 }, (_, i) => <Bone key={i} className="h-5 w-full" />)}
        </div>
        <section className="space-y-4">
          <div className="flex gap-2">
            <Bone className="h-9 w-24 rounded-full" />
            <Bone className="h-9 w-28 rounded-full" />
            <Bone className="h-9 w-20 rounded-full" />
          </div>
          <ul className="divide-y divide-border lg:grid lg:grid-cols-3 lg:gap-3 lg:divide-y-0 xl:grid-cols-4">
            {Array.from({ length: 8 }, (_, i) => <ProductRow key={i} />)}
          </ul>
        </section>
      </div>
    </Shell>
  );
}

/** Single product page. */
export function ProductSkeleton() {
  return (
    <Shell>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)_300px] lg:gap-8">
        <Bone className="aspect-square w-full rounded-lg" />
        <div className="space-y-4">
          <Bone className="h-3 w-40" />
          <Bone className="h-6 w-full" />
          <Bone className="h-6 w-2/3" />
          <div className="flex gap-2">
            <Bone className="h-8 w-20 rounded-full" />
            <Bone className="h-8 w-16 rounded-full" />
          </div>
          <Lines n={5} />
        </div>
        <div className="space-y-3 rounded-lg border border-border p-4">
          <Bone className="h-5 w-1/2" />
          <Bone className="h-4 w-full" />
          <Bone className="h-7 w-2/3" />
          <Bone className="h-12 w-full rounded-md" />
        </div>
      </div>
    </Shell>
  );
}

/** Blog post. */
export function ArticleSkeleton() {
  return (
    <Shell className="lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-8">
      <div className="space-y-4">
        <Bone className="h-3 w-48" />
        <Bone className="h-7 w-full" />
        <Bone className="h-7 w-1/2" />
        <Bone className="aspect-video w-full rounded-md" />
        <Lines n={6} />
        <Lines n={4} />
      </div>
      <div className="hidden space-y-3 lg:block">
        <Bone className="h-40 w-full rounded-md" />
        <Bone className="h-64 w-full rounded-md" />
      </div>
    </Shell>
  );
}

/** Blog home / archives: grid of post cards. */
export function PostGridSkeleton() {
  return (
    <Shell className="space-y-5">
      <Bone className="h-7 w-1/2 lg:w-1/4" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="space-y-3">
            <Bone className="aspect-video w-full rounded-md" />
            <Bone className="h-4 w-full" />
            <Bone className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    </Shell>
  );
}

/** Cart and checkout steps: line list + summary box. */
export function CartSkeleton() {
  return (
    <Shell className="lg:grid lg:grid-cols-12 lg:gap-8">
      <div className="space-y-3 lg:col-span-8">
        <Bone className="h-4 w-32" />
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="flex gap-3 rounded-md border border-border p-3">
            <Bone className="size-20 shrink-0 rounded-md" />
            <div className="flex-1 space-y-2">
              <Bone className="h-4 w-3/4" />
              <Bone className="h-3 w-1/2" />
              <Bone className="h-9 w-32 rounded-sm" />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 space-y-3 rounded-md border border-border p-4 lg:col-span-4 lg:mt-0">
        <Bone className="h-4 w-full" />
        <Bone className="h-4 w-full" />
        <Bone className="h-5 w-2/3" />
        <Bone className="h-12 w-full rounded-md" />
      </div>
    </Shell>
  );
}

/** Inside the account shell (the sidebar stays put). */
export function AccountSkeleton() {
  return (
    <div role="status" aria-busy="true" className="space-y-4 py-4">
      <span className="sr-only">در حال بارگذاری…</span>
      <Bone className="h-6 w-40" />
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="space-y-2 rounded-md border border-border p-4">
          <Bone className="h-4 w-1/2" />
          <Bone className="h-3 w-full" />
          <Bone className="h-3 w-2/3" />
        </div>
      ))}
    </div>
  );
}
