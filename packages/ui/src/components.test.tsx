import { render, screen } from '@testing-library/react';
import type { ProductCard as ProductCardData } from '@banovit/api-client';
import { Accordion } from './Accordion';
import { Breadcrumb } from './Breadcrumb';
import { formatToman } from './lib/format';
import { Pagination, pageWindow } from './Pagination';
import { ProductCard } from './ProductCard';

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('next/image', () => ({
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
  default: ({ fill: _f, priority: _p, ...props }: Record<string, unknown>) => <img {...(props as object)} />,
}));

const card: ProductCardData = {
  id: 1,
  slug: 'basin-a',
  name: 'روشویی کابینت‌دار A',
  path: '/shop/basin-a/',
  image: { url: 'https://banovit.com/a.jpg', alt: 'روشویی A', width: null, height: null, blurhash: null },
  brand: { slug: 'alka', name: 'آلکا' },
  price: { amount: 8_000_000, currency: 'IRR' },
  price_max: null,
  regular_price: { amount: 10_000_000, currency: 'IRR' },
  discount_percent: 20,
  in_stock: true,
  rating: { average: 4.5, count: 12 },
  colors: [{ slug: 'white', name: 'سفید', hex: '#ffffff' }],
  colors_more: 2,
  sizes: { label: 'سایز', values: ['۶۰', '۸۰'], more: 1 },
  badges: { install_service: true, amazing_discount: true },
};

describe('format', () => {
  it('shows rial as toman with Persian digits', () => {
    expect(formatToman(8_000_000)).toBe('۸۰۰٬۰۰۰');
  });
});

describe('ProductCard', () => {
  it('renders price, discount, badges, sizes and links to the product', () => {
    render(<ProductCard product={card} />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/shop/basin-a/');
    expect(screen.getByText('۸۰۰٬۰۰۰')).toBeInTheDocument();
    expect(screen.getByText('۲۰٪')).toBeInTheDocument();
    expect(screen.getByText('تخفیف شگفت‌انگیز')).toBeInTheDocument();
    expect(screen.getByText('امکان افزودن خدمات نصب')).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'سایز' })).toHaveTextContent('۶۰۸۰+۱');
    expect(screen.getByAltText('روشویی A')).toBeInTheDocument();
  });

  it('shows «ناموجود» instead of a price when out of stock', () => {
    render(<ProductCard product={{ ...card, in_stock: false }} />);
    expect(screen.getByText('ناموجود')).toBeInTheDocument();
    expect(screen.queryByText('۸۰۰٬۰۰۰')).not.toBeInTheDocument();
  });
});

describe('Breadcrumb', () => {
  it('links every item but the current page', () => {
    render(<Breadcrumb items={[{ name: 'بانویت', url: '/' }, { name: 'روشویی', url: '/shop/category/vanity/' }]} />);
    expect(screen.getAllByRole('link')).toHaveLength(1);
    expect(screen.getByText('روشویی')).toHaveAttribute('aria-current', 'page');
  });
});

describe('Pagination', () => {
  it('builds a window with gaps', () => {
    expect(pageWindow(6, 20)).toEqual([1, 'gap', 5, 6, 7, 'gap', 20]);
    expect(pageWindow(1, 3)).toEqual([1, 2, 3]);
  });

  it('renders crawlable prev/next links', () => {
    render(<Pagination current={2} last={3} hrefFor={(p) => (p === 1 ? '/c/' : `/c/page/${p}/`)} />);
    expect(screen.getByLabelText('صفحه قبل')).toHaveAttribute('href', '/c/');
    expect(screen.getByLabelText('صفحه بعد')).toHaveAttribute('href', '/c/page/3/');
  });
});

describe('Accordion', () => {
  it('keeps answers in the markup', () => {
    render(<Accordion items={[{ id: 1, title: 'گارانتی؟', html: '<p>بله</p>' }]} />);
    expect(screen.getByText('بله')).toBeInTheDocument();
  });
});
