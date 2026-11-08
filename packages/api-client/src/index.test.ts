import { describe, expect, it, vi } from 'vitest';
import { createStorefrontClient, listingQueryString, StorefrontApiError } from './index';

describe('listingQueryString', () => {
  it('serializes filters in a stable order and drops empty values', () => {
    expect(
      listingQueryString({ page: 2, brand: 'alka,golsar', filter: { pa_size: '60', pa_color: 'white' }, in_stock: true, on_sale: false }),
    ).toBe('?page=2&brand=alka%2Cgolsar&filter%5Bpa_color%5D=white&filter%5Bpa_size%5D=60&in_stock=1');
    expect(listingQueryString({})).toBe('');
  });
});

describe('client', () => {
  it('encodes Persian category paths and sends the internal token', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: { id: 1 } }), { status: 200 }));
    const api = createStorefrontClient({ baseUrl: 'http://cms/api/storefront/v1/', internalToken: 't', fetch: fetchMock });
    await api.getCategory('/vanity/%D8%B1%D9%88%D8%B4%D9%88%DB%8C%DB%8C/');
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe('http://cms/api/storefront/v1/categories/vanity/%D8%B1%D9%88%D8%B4%D9%88%DB%8C%DB%8C');
    expect((init.headers as Headers).get('X-Storefront-Token')).toBe('t');
  });

  it('maps the error envelope to StorefrontApiError', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: { code: 'not_found', message: 'پیدا نشد' } }), { status: 404 }),
    );
    const api = createStorefrontClient({ baseUrl: 'http://cms', fetch: fetchMock });
    await expect(api.getCategory('x')).rejects.toMatchObject({ status: 404, code: 'not_found' });
    await expect(api.getCategory('x')).rejects.toBeInstanceOf(StorefrontApiError);
  });
});

describe('blog', () => {
  it('builds the posts query and exposes the moved location of renamed posts', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: [], meta: { page: 2, per_page: 12, total: 0, last_page: 1 }, links: {} }), { status: 200 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: { code: 'moved', message: 'x', location: '/blog/new/' } }), { status: 404 }),
      );
    const api = createStorefrontClient({ baseUrl: 'http://cms', fetch: fetchMock });
    await api.listBlogPosts({ page: 2, category: 'toilet/wallhang', q: '' });
    expect(fetchMock.mock.calls[0]![0]).toBe('http://cms/blog/posts?page=2&category=toilet%2Fwallhang');
    await expect(api.getBlogPost('شیر')).rejects.toMatchObject({ status: 404, code: 'moved', location: '/blog/new/' });
    expect(fetchMock.mock.calls[1]![0]).toBe('http://cms/blog/posts/%D8%B4%DB%8C%D8%B1');
  });
});
