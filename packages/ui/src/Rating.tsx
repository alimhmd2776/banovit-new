import { IconStar } from './icons';
import { faDigits } from './lib/format';

export function Rating({ average, count }: { average: number; count?: number }) {
  const value = Math.round(average * 10) / 10;
  return (
    <span className="inline-flex items-center gap-0.5 text-xs text-text-muted" aria-label={`امتیاز ${faDigits(value)} از ۵`}>
      <IconStar size={14} className="text-rating" />
      <span className="font-medium text-text">{faDigits(value)}</span>
      {count ? <span>({faDigits(count)})</span> : null}
    </span>
  );
}
