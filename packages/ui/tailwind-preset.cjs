/**
 * Shared Tailwind preset: every color/radius/shadow maps to a CSS variable from
 * tokens/tokens.css, so pages never contain raw hex values.
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  theme: {
    screens: { sm: '640px', md: '768px', lg: '1024px', xl: '1280px', '2xl': '1440px' },
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        surface: { DEFAULT: 'var(--color-surface)', muted: 'var(--color-surface-muted)' },
        border: { DEFAULT: 'var(--color-border)', strong: 'var(--color-border-strong)' },
        text: { DEFAULT: 'var(--color-text)', muted: 'var(--color-text-muted)', subtle: 'var(--color-text-subtle)' },
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
          subtle: 'var(--color-primary-subtle)',
          'on-subtle': 'var(--color-on-primary-subtle)',
          on: 'var(--color-on-primary)',
        },
        success: { DEFAULT: 'var(--color-success)', subtle: 'var(--color-success-subtle)', 'on-subtle': 'var(--color-on-success-subtle)' },
        warning: { DEFAULT: 'var(--color-warning)', subtle: 'var(--color-warning-subtle)', 'on-subtle': 'var(--color-on-warning-subtle)' },
        danger: { DEFAULT: 'var(--color-danger)', subtle: 'var(--color-danger-subtle)', 'on-subtle': 'var(--color-on-danger-subtle)' },
        deal: { DEFAULT: 'var(--color-deal)', on: 'var(--color-on-deal)' },
        rating: 'var(--color-rating)',
        overlay: 'var(--color-overlay)',
        focus: 'var(--color-focus-ring)',
      },
      fontFamily: { sans: ['var(--font-sans)'] },
      borderRadius: {
        xs: 'var(--radius-xs)',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
      },
      boxShadow: { xs: 'var(--shadow-xs)', sm: 'var(--shadow-sm)', md: 'var(--shadow-md)', lg: 'var(--shadow-lg)' },
      zIndex: { sticky: '1100', drawer: '1200', modal: '1300' },
      maxWidth: { container: 'var(--container-max)' },
      spacing: { header: 'var(--header-height)', 'bottom-nav': 'var(--bottom-nav-height)' },
      transitionTimingFunction: { standard: 'var(--ease-standard)' },
    },
  },
};
