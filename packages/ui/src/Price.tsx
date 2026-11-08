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
    <div className={cx('flex flex-col items-end gap-1', className)}>
      {regular && discountPercent > 0 ? (
        <div className="flex items-center gap-1.5">
          <span className="rounded-xs bg-danger px-1.5 text-[11px] font-bold leading-5 text-primary-on">
            {faDigits(discountPercent)}٪
          </span>
          <del className="text-xs text-text-subtle" aria-label="قیمت قبل">
            {formatToman(regular.amount)}
          </del>
        </div>
      ) : null}
      <p className={cx('font-extrabold text-text', size === 'lg' ? 'text-xl' : 'text-lg lg:text-base')}>
        {priceMax ? <span className="text-xs font-normal text-text-muted">از </span> : null}
        {formatToman(price.amount)}
        <span className="ms-1 text-sm font-bold">تومان</span>
      </p>
    </div>
  );
}
