import type { ContentPage } from '@banovit/api-client';
import { Breadcrumb } from '@banovit/ui';
import { jsonLdScript } from '@/lib/seo';
import { BackButton } from './BackButton';
import { Blocks, Prose } from './blocks';
import { knownBlocks } from './types';

/**
 * One CMS content page. Layout per template:
 * - default:  title bar + rich text (pages migrated as HTML, e.g. /privacy-policy/)
 * - document: title bar + logo intro + accordion card (/terms/)
 * - feature:  title bar over a full-bleed hero + designed sections (/about-us/, /shipping-methods/)
 * Mobile follows the 393px designs; from lg the same blocks sit in a centered column.
 */
export function PageView({ page, jsonLd }: { page: ContentPage; jsonLd: unknown }) {
  const blocks = knownBlocks(page.blocks);
  const crumbs = [{ name: 'بانویت', url: '/' }, ...page.breadcrumb.map((c) => ({ name: c.name, url: c.url }))];
  const parent = page.breadcrumb.length > 1 ? page.breadcrumb[page.breadcrumb.length - 2]!.url : '/';
  const isFeature = page.template === 'feature' && blocks[0]?.type === 'hero';

  return (
    <article className="pb-[calc(var(--bottom-nav-height)+32px)] lg:pb-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(jsonLd)} />
      <div className="border-b border-border bg-surface lg:border-none lg:bg-transparent">
        <div className="mx-auto flex max-w-[880px] items-center gap-3 px-4 py-3 lg:flex-col lg:items-start lg:gap-2 lg:px-0 lg:pt-6">
          <div className="lg:hidden">
            <BackButton fallback={parent} />
          </div>
          <Breadcrumb items={crumbs} className="hidden lg:flex" />
          <h1 className="min-w-0 truncate text-base font-bold text-text lg:whitespace-normal lg:text-2xl">{page.title}</h1>
        </div>
      </div>

      <div className={isFeature ? 'mx-auto flex max-w-[880px] flex-col gap-6 lg:mt-4 lg:gap-8' : 'mx-auto flex max-w-[880px] flex-col gap-6 pt-5 lg:gap-8 lg:pt-4'}>
        {blocks.length > 0 ? (
          <Blocks blocks={blocks} />
        ) : page.body_html ? (
          <Prose html={page.body_html} className="mx-4 rounded-lg bg-surface p-4 lg:mx-0 lg:p-8" />
        ) : null}
      </div>
    </article>
  );
}
