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

/* contact page */
export const IconMapFold = make(<path d="M9 4L3.5 6v14L9 18l6 2 5.5-2V4L15 6zM9 4v14M15 6v14" />, 'IconMapFold');
export const IconBuilding = make(<><rect x="5" y="3" width="14" height="18" rx="1.5" /><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M10 21v-3h4v3" /></>, 'IconBuilding');
export const IconWarehouse = make(<><path d="M3 9l9-5 9 5v11H3z" /><path d="M7 20v-7h10v7M7 16h10" /></>, 'IconWarehouse');
export const IconClock = make(<><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>, 'IconClock');
export const IconMail = make(<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M4 7l8 6 8-6" /></>, 'IconMail');
export const IconNavigation = make(<path d="M12 3l7 18-7-4-7 4z" />, 'IconNavigation');
export const IconCheckCircle = make(<><circle cx="12" cy="12" r="8.5" /><path d="M8.5 12.5l2.5 2.5 4.5-5" /></>, 'IconCheckCircle');

/* social networks (simplified marks, single color) */
export const IconWhatsapp = make(
  <><path d="M4 20l1.2-3.9A8.5 8.5 0 1 1 8 19z" /><path d="M9.2 8.6c.2-.5.6-.5.9-.5.3 0 .5.6.8 1.3.1.3-.4.8-.5 1 .4 1 1.2 1.8 2.2 2.3.2-.2.6-.7.9-.6.6.2 1.3.5 1.3.8 0 .7-.7 1.4-1.4 1.4-2.3 0-5-2.6-4.9-4.8 0-.3.2-.6.7-.9z" fill="currentColor" stroke="none" /></>,
  'IconWhatsapp',
);
export const IconTelegram = make(<><circle cx="12" cy="12" r="9" fill="currentColor" stroke="none" /><path d="M7 11.8l9-3.6-1.5 8-3.2-2.4-1.6 1.6.2-2.6 3.8-3.6-5 3z" fill="var(--color-surface, #fff)" stroke="none" /></>, 'IconTelegram');
export const IconInstagram = make(<><rect x="4" y="4" width="16" height="16" rx="4.5" /><circle cx="12" cy="12" r="3.6" /><circle cx="16.8" cy="7.2" r="0.9" fill="currentColor" stroke="none" /></>, 'IconInstagram');
export const IconBale = make(<><circle cx="12" cy="12" r="8.5" /><path d="M8 9.5c1.3-1.4 2.7-1.4 4 0s2.7 1.4 4 0M8 14.5c1.3-1.4 2.7-1.4 4 0s2.7 1.4 4 0" /></>, 'IconBale');
export const IconChat = make(<path d="M4 5h16v11H9l-5 4z" />, 'IconChat');

// Header, mega menu and mobile drawer (menu thread)
export const IconHeart = make(<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />, 'IconHeart');
export const IconPercent = make(<><path d="M19 5L5 19" /><circle cx="7" cy="7" r="2" /><circle cx="17" cy="17" r="2" /></>, 'IconPercent');
export const IconChartPie = make(<><circle cx="12" cy="12" r="8" /><path d="M12 4v8l5.7 5.7" /></>, 'IconChartPie');
export const IconFlame = make(<path d="M12 21c-3.9 0-6-2.6-6-5.6 0-3.6 3-5.4 3.6-8.9 2.1 1.4 3.2 3.2 3.4 5.2.8-.6 1.4-1.6 1.6-2.7 2 1.6 3.4 3.8 3.4 6.4 0 3-2.1 5.6-6 5.6z" />, 'IconFlame');
export const IconBook = make(<><path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v15H5.5A1.5 1.5 0 0 0 4 20.5z" /><path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H13v15h5.5a1.5 1.5 0 0 1 1.5 1.5z" /></>, 'IconBook');
export const IconOrderSearch = make(<><path d="M14 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5" /><path d="M8 8h6M8 12h3" /><circle cx="16" cy="15" r="3" /><path d="M18.2 17.2L20 19" /></>, 'IconOrderSearch');
export const IconArticle = make(<><rect x="5" y="3.5" width="14" height="17" rx="2" /><path d="M9 8h6M9 12h6M9 16h3" /></>, 'IconArticle');
export const IconUserSquare = make(<><rect x="4" y="4" width="16" height="16" rx="3" /><circle cx="12" cy="10" r="2.5" /><path d="M7.5 17c.8-2 2.5-3 4.5-3s3.7 1 4.5 3" /></>, 'IconUserSquare');
export const IconBag = make(<><path d="M6 8h12l-1 12H7z" /><path d="M9 8V6.5a3 3 0 0 1 6 0V8" /></>, 'IconBag');
export const IconDots4 = make(<><circle cx="7.5" cy="7.5" r="2.5" /><circle cx="16.5" cy="7.5" r="2.5" /><circle cx="7.5" cy="16.5" r="2.5" /><circle cx="16.5" cy="16.5" r="2.5" /></>, 'IconDots4');
