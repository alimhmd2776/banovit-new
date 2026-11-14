/**
 * Rich text from the old WordPress site (Elementor / theme wrappers) carries
 * class names such as "text-left" or "hidden" that collide with this site's
 * Tailwind utilities and silently restyle the content (a Persian text shown
 * left-aligned). The CMS HTML is styled only through its tags, so imported
 * class attributes are dropped before rendering.
 */
export function stripForeignClasses(html: string): string {
  return html.replace(/\s+class\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
}
