import { permanentRedirect } from 'next/navigation';

/** WooCommerce «آدرس‌ها» URL. */
export default function LegacyEditAddress() {
  permanentRedirect('/my-account/addresses/');
}
