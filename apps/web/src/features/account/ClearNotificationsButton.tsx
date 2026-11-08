'use client';

import { IconTrash } from '@banovit/ui';
import { appBarButton } from './AppBar';

/** App-bar trash button; triggers the list's hidden clear action (keeps one source of truth for state). */
export function ClearNotificationsButton({ disabled }: { disabled: boolean }) {
  return (
    <button type="button" aria-label="حذف اعلان‌ها" disabled={disabled} className={appBarButton} onClick={() => document.getElementById('clear-notifications')?.click()}>
      <IconTrash size={20} />
    </button>
  );
}
