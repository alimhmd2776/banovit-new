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

  it('fetches content pages by encoded path and unwraps data', async () => {
    const fetchMock = vi.fn().mockImplementation(async () => new Response(JSON.stringify({ data: { id: 7, url: '/landing/b2b/' } }), { status: 200 }));
    const api = createStorefrontClient({ baseUrl: 'http://cms', fetch: fetchMock });
    const page = await api.getPage('/landing/b2b/');
    expect(fetchMock.mock.calls[0]![0]).toBe('http://cms/pages/landing/b2b');
    expect(page.id).toBe(7);
    await api.getPage('پیش-فاکتور');
    expect(fetchMock.mock.calls[1]![0]).toBe('http://cms/pages/%D9%BE%DB%8C%D8%B4-%D9%81%D8%A7%DA%A9%D8%AA%D9%88%D8%B1');
  });
});
