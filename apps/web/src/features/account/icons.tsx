/** Account-area icons (24px grid, stroke = currentColor), same style as @banovit/ui icons. */
import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement> & { size?: number };

function make(paths: React.ReactNode, name: string) {
  const Icon = ({ size = 20, ...props }: P) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...props}>
      {paths}
    </svg>
  );
  Icon.displayName = name;
  return Icon;
}

export const IconBell = make(<><path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15z" /><path d="M10 20a2 2 0 0 0 4 0" /></>, 'IconBell');
export const IconEdit = make(<><path d="M4 20h4L19 9l-4-4L4 16z" /><path d="M13.5 6.5l4 4" /></>, 'IconEdit');
export const IconEditBox = make(<><path d="M20 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5" /><path d="M10 14l1-4 8-8 3 3-8 8z" /></>, 'IconEditBox');
export const IconBag = make(<><path d="M5 8h14l-1 12H6z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></>, 'IconBag');
export const IconHeart = make(<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />, 'IconHeart');
export const IconHistory = make(<><path d="M4 12a8 8 0 1 0 2.3-5.6" /><path d="M4 4v4h4" /><path d="M12 8v4l3 2" /></>, 'IconHistory');
export const IconComment = make(<><path d="M4 5h16v11H9l-5 4z" /></>, 'IconComment');
export const IconHeadset = make(<><path d="M4 14v-2a8 8 0 0 1 16 0v2" /><rect x="3" y="13" width="4" height="6" rx="1.5" /><rect x="17" y="13" width="4" height="6" rx="1.5" /></>, 'IconHeadset');
export const IconInfo = make(<><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>, 'IconInfo');
export const IconShield = make(<><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" /><path d="M9 12l2 2 4-4" /></>, 'IconShield');
export const IconStore = make(<><path d="M4 9l1.5-5h13L20 9" /><path d="M5 9v11h14V9" /><path d="M4 9h16" /><path d="M10 20v-5h4v5" /></>, 'IconStore');
export const IconTrash = make(<><path d="M4 7h16M10 11v6M14 11v6" /><path d="M6 7l1 13h10l1-13" /><path d="M9 7V4h6v3" /></>, 'IconTrash');
export const IconMore = make(<><circle cx="5" cy="12" r="1" fill="currentColor" /><circle cx="12" cy="12" r="1" fill="currentColor" /><circle cx="19" cy="12" r="1" fill="currentColor" /></>, 'IconMore');
export const IconPin = make(<><path d="M12 21s-6-5.5-6-11a6 6 0 1 1 12 0c0 5.5-6 11-6 11z" /><circle cx="12" cy="10" r="2.2" /></>, 'IconPin');
export const IconSend = make(<path d="M20 4L3 11l7 2 2 7z M10 13l10-9" />, 'IconSend');
export const IconImage = make(<><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="8.5" cy="10" r="1.5" /><path d="M21 16l-5-5-8 8" /></>, 'IconImage');
export const IconLogout = make(<><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" /><path d="M10 8l-4 4 4 4M6 12h10" /></>, 'IconLogout');
export const IconPalette = make(<><path d="M12 3a9 9 0 1 0 0 18c1 0 1.5-.8 1.5-1.5 0-1-.8-1.5-.8-2.5a1.5 1.5 0 0 1 1.5-1.5H17a4 4 0 0 0 4-4c0-4.7-4-8.5-9-8.5z" /><circle cx="7.5" cy="11" r="1" /><circle cx="10" cy="7" r="1" /><circle cx="15" cy="7.5" r="1" /></>, 'IconPalette');
export const IconReceipt = make(<><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" /><path d="M9 8h6M9 12h6" /></>, 'IconReceipt');
export const IconTruck = make(<><path d="M3 6h11v10H3zM14 9h4l3 3v4h-7" /><circle cx="7" cy="18" r="1.6" /><circle cx="17" cy="18" r="1.6" /></>, 'IconTruck');
export const IconCube = make(<><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" /><path d="M4 7.5l8 4.5 8-4.5M12 12v9" /></>, 'IconCube');
export const IconCheckCircle = make(<><circle cx="12" cy="12" r="9" /><path d="M8 12l3 3 5-6" /></>, 'IconCheckCircle');
export const IconClock = make(<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>, 'IconClock');
export const IconReturn = make(<><path d="M9 14l-5-5 5-5" /><path d="M4 9h10a6 6 0 0 1 0 12h-3" /></>, 'IconReturn');
export const IconRuler = make(<><path d="M3 17L17 3l4 4L7 21z" /><path d="M7 13l2 2M10 10l2 2M13 7l2 2" /></>, 'IconRuler');
export const IconCard = make(<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18M7 15h3" /></>, 'IconCard');
export const IconPrinter = make(<><path d="M7 9V3h10v6" /><rect x="3" y="9" width="18" height="8" rx="2" /><path d="M7 14h10v7H7z" /></>, 'IconPrinter');
