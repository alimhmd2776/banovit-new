import { IconChevronDown } from './icons';
import { cx } from './lib/format';

export type AccordionItem = { id: string | number; title: string; html: string };

/**
 * FAQ accordion on native <details>: works without JS and the answers stay in
 * the HTML for crawlers (FAQPage JSON-LD is emitted from the same items).
 */
export function Accordion({ items, className }: { items: AccordionItem[]; className?: string }) {
  return (
    <div className={cx('divide-y divide-border overflow-hidden rounded-md border border-border bg-surface', className)}>
      {items.map((item) => (
        <details key={item.id} className="group">
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
