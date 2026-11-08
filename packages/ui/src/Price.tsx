import { cx, faDigits, formatToman } from './lib/format';

type MoneyLike = { amount: number } | null | undefined;

/** Price block: optional struck regular price + discount badge, then the price in toman. */
export function Price({
  price,
  priceMax,
  regular,
  discountPercent = 0,
  size = 'md',
  className,
}: {
  price: MoneyLike;
  priceMax?: MoneyLike;
  regular?: MoneyLike;
  discountPercent?: number;
  size?: 'md' | 'lg';
  className?: string;
}) {
  if (!price) {
    return <p className={cx('text-sm text-text-muted', className)}>تماس بگیرید</p>;
  }
  return (
    <div className={cx('flex flex-col items-end gap-0.5', className)}>
      {regular && discountPercent > 0 ? (
        <div className="flex items-center gap-1.5">
          <del className="text-xs text-text-subtle" aria-label="قیمت قبل">
            {formatToman(regular.amount)}
          </del>
          <span className="rounded-full bg-danger px-1.5 text-[11px] font-bold leading-5 text-primary-on">
            {faDigits(discountPercent)}٪
          </span>
        </div>
      ) : null}
      <p className={cx('font-bold text-text', size === 'lg' ? 'text-lg' : 'text-[15px]')}>
        {priceMax ? <span className="text-xs font-normal text-text-muted">از </span> : null}
        {formatToman(price.amount)}
        <span className="ms-1 text-[11px] font-normal text-text-muted">تومان</span>
      </p>
    </div>
  );
}
