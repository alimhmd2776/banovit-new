import { IconChevronDown } from './icons';
import { cx } from './lib/format';

export type AccordionItem = { id: string | number; title: string; html: string };

/**
 * FAQ accordion on native <details>: works without JS and the answers stay in
 * the HTML for crawlers (FAQPage JSON-LD is emitted from the same items).
 */
export function Accordion({
  items,
  className,
  variant = 'list',
}: {
  items: AccordionItem[];
  className?: string;
  /** list: one bordered box with dividers; cards: a separate rounded card per item */
  variant?: 'list' | 'cards';
}) {
  const cards = variant === 'cards';
  return (
    <div className={cx(cards ? 'space-y-2' : 'divide-y divide-border overflow-hidden rounded-md border border-border bg-surface', className)}>
      {items.map((item) => (
        <details key={item.id} className={cx('group', cards && 'rounded-md border border-border bg-surface open:border-primary-subtle open:shadow-xs')}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 text-sm font-medium text-text [&::-webkit-details-marker]:hidden">
            {item.title}
            <IconChevronDown size={18} className="shrink-0 text-text-muted transition-transform duration-150 group-open:rotate-180" />
          </summary>
          <div className="prose-sm px-4 pb-4 text-sm leading-7 text-text-muted" dangerouslySetInnerHTML={{ __html: item.html }} />
        </details>
      ))}
    </div>
  );
}
