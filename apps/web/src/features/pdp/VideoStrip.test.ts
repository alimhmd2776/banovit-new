import { describe, expect, it } from 'vitest';
import { embedUrl } from './VideoStrip';

describe('product video urls', () => {
  it('embeds YouTube and Vimeo pages, plays files directly', () => {
    expect(embedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0');
    expect(embedUrl('https://youtu.be/dQw4w9WgXcQ')).toContain('/embed/dQw4w9WgXcQ');
    expect(embedUrl('https://vimeo.com/123456')).toBe('https://player.vimeo.com/video/123456?autoplay=1');
    expect(embedUrl('https://banovit.com/wp-content/uploads/v.mp4')).toBeNull();
  });
});
