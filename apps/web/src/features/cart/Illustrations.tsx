/** Soft 3D-style illustrations of the cart/result screens, drawn with tokens (no raster assets). */

export function EmptyBasketArt() {
  return (
    <svg viewBox="0 0 200 150" width="200" height="150" aria-hidden="true" className="mx-auto">
      <defs>
        <linearGradient id="eb-body" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="var(--neutral-0)" />
          <stop offset="1" stopColor="var(--neutral-200)" />
        </linearGradient>
      </defs>
      <g fill="none" stroke="var(--neutral-300)" strokeWidth="5" strokeLinecap="round">
        <path d="M40 30v12M34 36h12M160 18v12M154 24h12" />
        <path d="M70 40l6 10M100 34v12M130 40l-6 10" />
      </g>
      <circle cx="100" cy="14" r="6" fill="none" stroke="var(--neutral-300)" strokeWidth="4" />
      <circle cx="130" cy="26" r="4" fill="none" stroke="var(--neutral-300)" strokeWidth="3" />
      <path d="M28 70h144l-8 62a10 10 0 0 1-10 9H46a10 10 0 0 1-10-9z" fill="url(#eb-body)" stroke="var(--neutral-200)" />
      <path d="M28 70h144v6H28z" fill="var(--neutral-200)" />
      <path d="M88 74a12 12 0 0 1 24 0" fill="none" stroke="var(--neutral-400)" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

export function ResultArt({ kind }: { kind: 'success' | 'failed' }) {
  const ok = kind === 'success';
  return (
    <svg viewBox="0 0 220 160" width="220" height="160" aria-hidden="true" className="mx-auto">
      <g fill="none" strokeLinecap="round" strokeWidth="6" stroke={ok ? 'var(--brand-500)' : 'var(--color-danger)'} opacity="0.85">
        <path d={ok ? 'M30 50l14 10M180 40l-14 14M40 120l14-4' : 'M30 70l18 4M190 70l-18 6M50 40l10 10'} />
      </g>
      <rect x="62" y="20" width="96" height="112" rx="10" fill="var(--neutral-0)" stroke="var(--neutral-200)" />
      <path d="M78 96h64M78 108h44" stroke="var(--neutral-300)" strokeWidth="6" strokeLinecap="round" />
      <path d="M40 92h140v46a8 8 0 0 1-8 8H48a8 8 0 0 1-8-8z" fill="var(--neutral-100)" stroke="var(--neutral-200)" />
      <circle cx="110" cy="62" r="24" fill={ok ? 'var(--brand-500)' : 'var(--color-danger)'} />
      {ok ? (
        <path d="M99 62l8 8 15-16" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M101 53l18 18M119 53l-18 18" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
      )}
    </svg>
  );
}
