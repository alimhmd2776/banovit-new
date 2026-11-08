import { describe, expect, it, vi } from 'vitest';
import { NextResponse } from 'next/server';
import { cartResponse, clearCartCookies, setOrderCookie } from './server';

vi.mock('server-only', () => ({}));

describe('cart cookies stay httpOnly', () => {
  it('sets the cart and order tokens without the readable x-middleware-set-cookie copy', () => {
    const res = cartResponse({ token: 'cart-secret-token', item_count: 2 } as never);
    setOrderCookie(res, 'BAN-FA12', 'order-secret');
    expect(res.headers.get('set-cookie')).toContain('cart-secret-token');
    expect(res.headers.get('set-cookie')).toContain('order-secret');
    expect(res.headers.get('x-middleware-set-cookie')).toBeNull();
  });

  it('clearing the cart leaves no copy either', () => {
    const res = NextResponse.json({});
    clearCartCookies(res);
    expect(res.headers.get('x-middleware-set-cookie')).toBeNull();
  });
});
