import Link from 'next/link';
import { IconChevronLeft } from '@banovit/ui';
import type { NavItem } from './nav';

/** Dashboard menu rows: icon + label at the start, optional note, chevron at the end. */
export function MenuList({ title, items, notes = {} }: { title: string; items: NavItem[]; notes?: Record<string, React.ReactNode> }) {
  return (
    <section className="mt-6">
      <h2 className="mb-1 text-sm text-text-muted">{title}</h2>
      <ul>
        {items.map((n) => (
          <li key={n.key}>
            <Link href={n.href} className="flex h-12 items-center gap-3 text-sm text-text hover:text-primary">
              <n.icon size={20} className="text-text" />
              <span className="flex-1 font-bold">{n.label}</span>
              {notes[n.key] ?? null}
              <IconChevronLeft size={18} className="text-text-muted" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
