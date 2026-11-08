import { describe, expect, it } from 'vitest';
import { knownBlocks } from './types';

describe('knownBlocks', () => {
  it('keeps known block types and drops unknown ones from a newer CMS', () => {
    const blocks = knownBlocks([
      { id: 'a', type: 'rich_text', v: 1, props: { html: '<p>x</p>' } },
      { id: 'b', type: 'video_embed', v: 1, props: {} },
      { id: 'c', type: 'accordion', v: 1, props: { open_first: false, items: [] } },
    ]);
    expect(blocks.map((b) => b.type)).toEqual(['rich_text', 'accordion']);
    expect(knownBlocks(undefined)).toEqual([]);
  });
});
