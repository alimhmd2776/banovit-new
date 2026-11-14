import { describe, expect, it } from 'vitest';
import { stripForeignClasses } from './foreign-classes';

describe('stripForeignClasses', () => {
  it('drops class attributes and keeps the rest', () => {
    const html = '<div class="elementor-element text-left" data-id="8"><p class=\'x\'>متن <a href="/a/" class=hidden>لینک</a></p></div>';
    expect(stripForeignClasses(html)).toBe('<div data-id="8"><p>متن <a href="/a/">لینک</a></p></div>');
  });
});
