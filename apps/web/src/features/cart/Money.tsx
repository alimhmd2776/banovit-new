import { cx, formatToman } from '@banovit/ui';

/** «۹۶٬۶۰۰٬۰۰۰ تومان» from integer rial. */
export function Money({ rial, className, unitClassName, free }: { rial: number; className?: string; unitClassName?: string; free?: string }) {
  if (rial === 0 && free) return <span className={className}>{free}</span>;
  return (
    <span className={cx('whitespace-nowrap', className)}>
      {formatToman(rial)}
      <span className={cx('ms-1 text-[0.8em] font-normal', unitClassName)}>تومان</span>
    </span>
  );
}
