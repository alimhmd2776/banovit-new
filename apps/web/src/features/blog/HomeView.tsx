import Link from 'next/link';
import type { BlogHome } from '@banovit/api-client';
import { IconAward, IconChevronLeft, IconHistory, IconHomeDesign, IconList, IconPointer, IconTool } from '@banovit/ui';
import { jsonLdScript } from '@/lib/seo';
import { blogArchiveJsonLd } from '@/lib/seo/blog';
import { MoreLink, PostList, PostRail, SectionHeader } from './cards';
import { BlogSearch, BlogTitleBar, CategoryTabs } from './chrome';
import { HeroSlider } from './HeroSlider';
import { internalHref } from './format';

const SECTION_ICONS: Record<string, React.ReactNode> = {
  'best-choose': <IconPointer size={20} />,
  'design-room': <IconHomeDesign size={20} />,
};

/**
 * /blog/ landing (design 01-blog-home-mobile): search, category tabs, featured
 * slider, popular rail, latest list, editorial sections, install promo, all posts.
 * «مطالب بیشتر» are real links to /blog/page/2/ (crawlable pagination).
 */
export function HomeView({ home }: { home: BlogHome }) {
  const [firstSection, ...otherSections] = home.sections;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(
          blogArchiveJsonLd({ url: '/blog/', name: home.seo.title, description: home.seo.description, crumbs: [{ name: 'مقالات', url: '/blog/' }], posts: home.all.posts }),
        )}
      />
      <div className="mx-auto max-w-container space-y-6 px-4 pb-24 pt-3 lg:space-y-10 lg:pb-16 lg:pt-6">
        <div className="space-y-4">
          <BlogTitleBar as="h1" />
          <BlogSearch />
          <CategoryTabs categories={home.categories} />
        </div>

        <HeroSlider posts={home.hero} />

        {home.popular.posts.length > 0 ? (
          <section aria-labelledby="blog-popular">
            <SectionHeader id="blog-popular" title={home.popular.title} kicker={home.popular.subtitle} icon={<IconAward size={20} />} />
            <PostRail posts={home.popular.posts} label={home.popular.title} />
          </section>
        ) : null}

        {home.latest.posts.length > 0 ? (
          <section aria-labelledby="blog-latest">
            <SectionHeader id="blog-latest" title={home.latest.title} kicker={home.latest.subtitle} icon={<IconHistory size={20} />} />
            <PostList posts={home.latest.posts} footer={<MoreLink href="/blog/page/2/" />} />
          </section>
        ) : null}

        {firstSection ? <EditorialSection section={firstSection} /> : null}

        {home.promo ? (
          <Link
            href={internalHref(home.promo.url)}
            className="flex items-center gap-3 rounded-lg bg-surface-muted p-4 hover:bg-primary-subtle focus-visible:outline-2 focus-visible:outline-focus"
          >
            <IconTool size={24} className="shrink-0 text-primary" />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold text-text">{home.promo.title}</span>
              {home.promo.text ? <span className="block text-xs text-text-muted">{home.promo.text}</span> : null}
            </span>
            {home.promo.cta ? (
              <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                {home.promo.cta}
                <IconChevronLeft size={16} />
              </span>
            ) : null}
          </Link>
        ) : null}

        {otherSections.map((s) => (
          <EditorialSection key={s.key} section={s} />
        ))}

        <section aria-labelledby="blog-all">
          <SectionHeader id="blog-all" title={home.all.title} kicker={home.all.subtitle} icon={<IconList size={20} />} />
          <PostList posts={home.all.posts} footer={home.all.total > home.all.posts.length ? <MoreLink href="/blog/page/2/" /> : null} />
        </section>
      </div>
    </>
  );
}

function EditorialSection({ section }: { section: BlogHome['sections'][number] }) {
  const id = `blog-${section.key ?? section.category?.slug}`;
  return (
    <section aria-labelledby={id}>
      <SectionHeader
        id={id}
        title={section.title}
        kicker={section.subtitle}
        icon={SECTION_ICONS[section.key ?? ''] ?? <IconList size={20} />}
        action={
          section.category ? (
            <Link href={section.category.url} className="shrink-0 text-xs font-medium text-primary hover:underline">
              همه
            </Link>
          ) : null
        }
      />
      <PostRail posts={section.posts} label={section.title} />
    </section>
  );
}
