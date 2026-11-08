import type { ContentBlock, Image } from '@banovit/api-client';

/**
 * Typed view of the block props the CMS sends (banovit-cms
 * App\Domain\Content\Blocks\BlockRegistry, schema v1). The API types blocks
 * generically; this union is the renderer's contract.
 */
export type IconName =
  | 'box' | 'warehouse' | 'home' | 'truck' | 'bus' | 'globe' | 'route' | 'sparkles' | 'users' | 'user' | 'shield' | 'shield-check'
  | 'heart' | 'lightbulb' | 'hand-heart' | 'badge-check' | 'clipboard' | 'package' | 'building' | 'factory' | 'info' | 'alert'
  | 'phone' | 'headset' | 'clock' | 'wallet' | 'card' | 'map-pin' | 'message' | 'star' | 'document' | 'scan' | 'bolt' | 'tag';

type Html = string | null;
type B<T extends string, P> = { id: string; type: T; v: number; props: P };

export type FeatureItem = { icon: IconName | null; title: string; badge: string | null; html: Html };

export type Block =
  | B<'rich_text', { html: Html }>
  | B<'hero', { title: string; highlight: string | null; subtitle: string | null; image: Image | null; badge_icon: IconName | null; show_logo: boolean }>
  | B<'brand_intro', { logo: 'banovit' | 'banovit-bar' | 'none'; title: string; html: Html }>
  | B<'section_heading', { eyebrow: string | null; title: string; icon: IconName | null; tone: 'primary' | 'danger'; html: Html }>
  | B<'accordion', { open_first: boolean; items: { title: string; html: Html }[] }>
  | B<'feature_list', { style: 'cards' | 'panel' | 'tiles' | 'rules'; items: FeatureItem[]; note_html: Html }>
  | B<'link_list', { items: { icon: IconName | null; title: string; subtitle: string | null; href: string | null; sheet_title: string | null; sheet_blocks: Block[] }[] }>
  | B<'notice', { tone: 'neutral' | 'primary' | 'warning'; title: string | null; html: Html }>
  | B<'image', { image: Image; caption: string | null; href: string | null }>
  | B<'steps', { items: { icon: IconName | null; title: string; html: Html }[] }>
  | B<'buttons', { items: { label: string; href: string; variant: 'primary' | 'secondary' }[] }>
  | B<'team', { members: { name: string; role: string | null; photo: Image | null }[] }>
  | B<'brand_logos', { brands: string[]; items?: { name: string; url: string; logo: Image | null }[] }>
  | B<'testimonials', { items: { quote: string; name: string; label: string | null; avatar: Image | null }[] }>;

export type BlockType = Block['type'];

export const KNOWN_BLOCKS: ReadonlySet<string> = new Set<BlockType>([
  'rich_text', 'hero', 'brand_intro', 'section_heading', 'accordion', 'feature_list', 'link_list',
  'notice', 'image', 'steps', 'buttons', 'team', 'brand_logos', 'testimonials',
]);

/** Drops block types this build does not know (a newer CMS may send more), so old deploys never crash. */
export function knownBlocks(blocks: ContentBlock[] | undefined): Block[] {
  return (blocks ?? []).filter((b) => KNOWN_BLOCKS.has(b.type)) as unknown as Block[];
}
