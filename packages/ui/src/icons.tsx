/** Minimal inline icon set (24px grid, stroke = currentColor). Decorative by default. */
import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function make(paths: React.ReactNode, displayName: string) {
  const Icon = ({ size = 20, ...props }: IconProps) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {paths}
    </svg>
  );
  Icon.displayName = displayName;
  return Icon;
}

export const IconChevronLeft = make(<path d="M15 6l-6 6 6 6" />, 'IconChevronLeft');
export const IconChevronRight = make(<path d="M9 6l6 6-6 6" />, 'IconChevronRight');
export const IconChevronDown = make(<path d="M6 9l6 6 6-6" />, 'IconChevronDown');
export const IconClose = make(<path d="M6 6l12 12M18 6L6 18" />, 'IconClose');
export const IconSort = make(<path d="M7 4v16M7 20l-3-3M7 20l3-3M17 20V4M17 4l-3 3M17 4l3 3" />, 'IconSort');
export const IconFilter = make(<path d="M4 6h16M7 12h10M10 18h4" />, 'IconFilter');
export const IconSearch = make(<><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></>, 'IconSearch');
export const IconCart = make(<><path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6" /><circle cx="10" cy="20" r="1.3" /><circle cx="17" cy="20" r="1.3" /></>, 'IconCart');
export const IconHome = make(<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />, 'IconHome');
export const IconGrid = make(<><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></>, 'IconGrid');
export const IconUser = make(<><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>, 'IconUser');
export const IconMenu = make(<path d="M4 7h16M4 12h16M4 17h16" />, 'IconMenu');
export const IconPhone = make(<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />, 'IconPhone');
export const IconStar = make(<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" fill="currentColor" stroke="none" />, 'IconStar');
export const IconTool = make(<path d="M14.5 6.5a4 4 0 0 0-5.3 5.3L4 17l3 3 5.2-5.2a4 4 0 0 0 5.3-5.3l-2.5 2.5-2.5-.5-.5-2.5z" />, 'IconTool');
export const IconBolt = make(<path d="M13 3L5 13h6l-1 8 8-10h-6z" fill="currentColor" stroke="none" />, 'IconBolt');
export const IconBox = make(<><path d="M3 7l9-4 9 4-9 4z" /><path d="M3 7v10l9 4 9-4V7" /><path d="M12 11v10" /></>, 'IconBox');
export const IconCheck = make(<path d="M5 12.5l4.5 4.5L19 7.5" />, 'IconCheck');
export const IconArrowBack = make(<path d="M5 12h14M13 6l6 6-6 6" />, 'IconArrowBack');
export const IconSliders = make(<><path d="M4 7h10M18 7h2M4 17h4M12 17h8" /><circle cx="16" cy="7" r="2" /><circle cx="10" cy="17" r="2" /></>, 'IconSliders');
export const IconPlus = make(<path d="M12 5v14M5 12h14" />, 'IconPlus');
export const IconMinus = make(<path d="M5 12h14" />, 'IconMinus');
export const IconHeart = make(<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />, 'IconHeart');
export const IconTrash = make(<><path d="M4 7h16M10 11v6M14 11v6" /><path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" /></>, 'IconTrash');
export const IconMapPin = make(<><path d="M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z" /><circle cx="12" cy="10" r="2.2" /></>, 'IconMapPin');
export const IconCheck = make(<path d="M5 12.5l4.5 4.5L19 7.5" />, 'IconCheck');
export const IconReceipt = make(<><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" /><path d="M9 8h6M9 12h6" /></>, 'IconReceipt');
export const IconCreditCard = make(<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18M7 15h4" /></>, 'IconCreditCard');
export const IconWallet = make(<><path d="M4 7a2 2 0 0 1 2-2h12v4" /><rect x="3" y="7" width="18" height="13" rx="2" /><circle cx="16" cy="13.5" r="1.2" /></>, 'IconWallet');
export const IconInfo = make(<><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>, 'IconInfo');
export const IconTag = make(<><path d="M3 12V4h8l10 10-8 8z" /><circle cx="7.5" cy="8" r="1.3" /></>, 'IconTag');
export const IconStore = make(<><path d="M4 10v10h16V10" /><path d="M3 10l2-6h14l2 6a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0" /></>, 'IconStore');
export const IconCalendar = make(<><rect x="4" y="5" width="16" height="16" rx="2" /><path d="M4 10h16M9 3v4M15 3v4" /></>, 'IconCalendar');
