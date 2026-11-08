'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Cart } from '@banovit/api-client';
import { rialToToman } from '@banovit/ui';
import { track } from '@/lib/analytics';
import { analyticsItems, cartApi } from '@/features/cart/client';
import { CheckoutBar, PrimaryAction } from '@/features/cart/CheckoutBar';
import { PageHeader } from '@/features/cart/PageHeader';
import { SummaryCard } from '@/features/cart/SummaryCard';
import { useCart } from '@/features/cart/use-cart';
import { AddressSheet } from './AddressSheet';
import { AddonsSection, AddressCard, DeliverySlots, InstallSheet, OrderItems } from './sections';
import { Steps } from './Steps';

/** Step 1 «تکمیل اطلاعات»: address, delivery day, add-ons, items. */
export function ShippingView({ initial }: { initial: Cart }) {
  const router = useRouter();
  const { cart, busy, error, setError, run } = useCart(initial);
  const [addressOpen, setAddressOpen] = useState(false);
  const [installOpen, setInstallOpen] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  useEffect(() => {
    track('begin_checkout', { value: rialToToman(initial.totals.payable.amount), coupon: initial.coupon?.code, items: analyticsItems(initial) });
    // First-touch attribution (utm/gclid) captured on landing, if any.
    try {
      const raw = window.localStorage.getItem('bnv_attribution');
      if (raw && !initial.options.address) void cartApi.update({ attribution: JSON.parse(raw) as Record<string, string> }).catch(() => null);
    } catch {
      /* storage unavailable */
    }
  }, [initial]);

  const next = () => {
    if (!cart.options.address) {
      setProblem('ابتدا آدرس تحویل را ثبت کنید.');
      setAddressOpen(true);
      return;
    }
    if (cart.delivery.requires_slot && !cart.options.delivery_date) {
      setProblem('زمان ارسال مرسوله را انتخاب کنید.');
      document.getElementById('slots-title')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setProblem(null);
    track('add_shipping_info', { value: rialToToman(cart.totals.payable.amount), shipping_tier: cart.delivery.zone.label, items: analyticsItems(cart) });
    router.push('/checkout/payment/');
  };

  const message = problem ?? error?.message ?? null;

  return (
    <>
      <PageHeader title="تکمیل اطلاعات" backHref="/cart/" backLabel="بازگشت به سبد خرید" />
      <Steps current={1} />
      <div className="mx-auto max-w-container px-4 pb-36 lg:grid lg:grid-cols-12 lg:gap-8 lg:pb-16 lg:pt-4">
        <div className="divide-y divide-border lg:col-span-8 lg:rounded-lg lg:border lg:border-border lg:bg-surface lg:px-6">
          {message ? (
            <p role="alert" className="my-4 rounded-sm bg-danger-subtle px-3 py-2 text-sm text-danger-on-subtle">
              {message}
            </p>
          ) : null}
          <AddressCard address={cart.options.address} onEdit={() => setAddressOpen(true)} />
          <DeliverySlots
            cart={cart}
            selected={cart.options.delivery_date}
            busy={busy !== null}
            onSelect={(d) => {
              setProblem(null);
              void run('slot', () => cartApi.update({ delivery_date: d }));
            }}
          />
          <AddonsSection
            cart={cart}
            busy={busy !== null}
            onPackaging={(on) => void run('packaging', () => cartApi.update({ packaging: on }))}
            onOpenInstall={() => setInstallOpen(true)}
          />
          <OrderItems cart={cart} />
        </div>
        <aside className="hidden lg:col-span-4 lg:block">
          <div className="sticky top-[calc(var(--header-height)+56px)]">
            <SummaryCard cart={cart}>
              <PrimaryAction label="اطلاعات پرداخت" onClick={next} disabled={!cart.ready_for_checkout} className="h-12 w-full" />
            </SummaryCard>
          </div>
        </aside>
      </div>

      <CheckoutBar totals={cart.totals} label="اطلاعات پرداخت" onClick={next} disabled={!cart.ready_for_checkout} />

      {addressOpen ? (
        <AddressSheet
          open
          onClose={() => setAddressOpen(false)}
          initial={cart.options.address}
          saving={busy === 'address'}
          serverErrors={error?.fields}
          onSave={(a) =>
            void run('address', () => cartApi.update({ address: a })).then((c) => {
              if (c) {
                setAddressOpen(false);
                setProblem(null);
              }
            })
          }
        />
      ) : null}
      <InstallSheet
        open={installOpen}
        onClose={() => {
          setInstallOpen(false);
          setError(null);
        }}
        cart={cart}
        busy={busy !== null}
        onToggle={(id, on) => void run(`install:${id}`, () => cartApi.setInstallation(id, on))}
      />
    </>
  );
}
