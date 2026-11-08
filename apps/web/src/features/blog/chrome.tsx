import Link from 'next/link';
import type { BlogCategoryTab } from '@banovit/api-client';
import { cx, IconSearch } from '@banovit/ui';

/**
 * Blog title bar of the design («گردشگری مقالات») with the page's own actions
 * (share/bookmark on posts). Sits under the shared SiteHeader.
 */
export function BlogTitleBar({ actions, as: Tag = 'p', labels }: { actions?: React.ReactNode; as?: 'p' | 'h1'; labels: { title_prefix: string; title_accent: string } }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Link href="/blog/" className="rounded-sm focus-visible:outline-2 focus-visible:outline-focus">
        <Tag className="text-lg font-extrabold text-text lg:text-2xl">
          {labels.title_prefix} <span className="text-primary">{labels.title_accent}</span>
        </Tag>
      </Link>
      {actions ? <div className="flex items-center gap-1 rounded-md border border-border bg-surface p-1">{actions}</div> : null}
    </div>
  );
}

/** GET /blog/?q= (results page is noindex). */
export function BlogSearch({ defaultValue = '', placeholder }: { defaultValue?: string; placeholder: string }) {
  return (
    <form action="/blog/" role="search" className="relative">
      <label htmlFor="blog-search" className="sr-only">
        جستجو در مقالات
      </label>
      <input
        id="blog-search"
        name="q"
        type="search"
        defaultValue={defaultValue}
        maxLength={100}
        placeholder={placeholder}
        className="h-12 w-full rounded-full border border-transparent bg-surface-muted ps-12 pe-4 text-sm text-text placeholder:text-text-subtle focus:border-primary focus:bg-surface focus:outline-none"
      />
      <IconSearch size={20} className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-text-muted" />
    </form>
  );
}

/** «همه مقالات» + top-level categories as pill links (real links: crawlable, work without JS). */
export function CategoryTabs({ categories, activePath, labels }: { categories: BlogCategoryTab[]; activePath?: string | null; labels: { all_tab: string; categories_title: string } }) {
  const roots = categories.filter((c) => c.parent_id === null || c.path === activePath);
  const tab = (active: boolean) =>
    cx(
      'inline-flex h-10 shrink-0 items-center whitespace-nowrap rounded-full border px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
      active ? 'border-text bg-text text-surface' : 'border-border bg-surface text-text hover:border-primary hover:text-primary',
    );
  return (
    <nav aria-label={labels.categories_title} className="-mx-4 lg:mx-0">
      <ul className="scrollbar-none flex gap-2 overflow-x-auto px-4 pb-1 lg:flex-wrap lg:px-0">
        <li>
          <Link href="/blog/" className={tab(!activePath)} aria-current={!activePath ? 'page' : undefined}>
            {labels.all_tab}
          </Link>
        </li>
        {roots.map((c) => (
          <li key={c.id}>
            <Link href={c.url} className={tab(activePath === c.path)} aria-current={activePath === c.path ? 'page' : undefined}>
              {c.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
