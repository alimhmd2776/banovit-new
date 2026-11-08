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
export const IconPlus = make(<path d="M12 5v14M5 12h14" />, 'IconPlus');
export const IconMinus = make(<path d="M5 12h14" />, 'IconMinus');

/* blog (feature/web-blog) */
export const IconBookmark = make(<path d="M6 4h12v17l-6-4-6 4z" />, 'IconBookmark');
export const IconShare = make(<><path d="M12 15V4M8 8l4-4 4 4" /><path d="M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7" /></>, 'IconShare');
export const IconEye = make(<><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>, 'IconEye');
export const IconBook = make(<path d="M3 5a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v15a2 2 0 0 0-2-2H3zM21 5a2 2 0 0 0-2-2h-5a2 2 0 0 0-2 2v15a2 2 0 0 1 2-2h7z" />, 'IconBook');
export const IconCalendar = make(<><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>, 'IconCalendar');
export const IconTag = make(<><path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z" /><circle cx="8" cy="8" r="1.5" /></>, 'IconTag');
export const IconFolder = make(<path d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />, 'IconFolder');
export const IconArrowUpLeft = make(<path d="M17 17L7 7M7 15V7h8" />, 'IconArrowUpLeft');
export const IconBulb = make(<><path d="M9 18h6M10 21h4" /><path d="M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3z" /></>, 'IconBulb');
export const IconList = make(<path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" />, 'IconList');
export const IconHistory = make(<><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5M12 7v5l3 2" /></>, 'IconHistory');
export const IconPointer = make(<><path d="M9 11V5a1.5 1.5 0 0 1 3 0v5M12 10V8.5a1.5 1.5 0 0 1 3 0V11M15 10.5a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-1a6 6 0 0 1-5-2.7L4 15a1.5 1.5 0 0 1 2.5-1.6L9 16" /><path d="M4 4l1.5 1.5M9 1v1.5M14 4l-1.5 1.5" /></>, 'IconPointer');
export const IconHomeDesign = make(<><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" /><path d="M9 21v-5h6v5M12 9v3" /></>, 'IconHomeDesign');
export const IconAward = make(<><circle cx="12" cy="9" r="6" /><path d="M12 6l1 2 2 .3-1.5 1.5.4 2.2-1.9-1-1.9 1 .4-2.2L9 8.3l2-.3z" /><path d="M8.5 14L7 21l5-3 5 3-1.5-7" /></>, 'IconAward');
export const IconLink = make(<><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></>, 'IconLink');
export const IconWhatsapp = make(<><path d="M4 20l1.3-3.8A8 8 0 1 1 8 19z" /><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 1a4 4 0 0 1-2-2l1-1-1-2z" /></>, 'IconWhatsapp');
export const IconTelegram = make(<path d="M21 4L3 11l6 2 2 6 3-4 4 3z M9 13l9-7" />, 'IconTelegram');
export const IconInstagram = make(<><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><path d="M17.5 6.5h.01" /></>, 'IconInstagram');
export const IconCheck = make(<path d="M5 12l5 5 9-10" />, 'IconCheck');
