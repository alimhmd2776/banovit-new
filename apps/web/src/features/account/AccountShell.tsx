import { AccountSidebar } from './AccountSidebar';

/**
 * Account layout. Phones: full-screen app view (site chrome hidden through
 * [data-account-shell] in globals.css, bottom nav stays). Desktop: site
 * header/footer + sidebar menu and content column.
 */
export function AccountShell({ name, phone, unread, children }: { name: string; phone: string | null; unread: number; children: React.ReactNode }) {
  return (
    <div data-account-shell className="mx-auto max-w-container px-4 pb-[calc(var(--bottom-nav-height)+40px)] lg:grid lg:grid-cols-[264px_minmax(0,1fr)] lg:gap-8 lg:py-8 lg:pb-12">
      <AccountSidebar name={name} phone={phone} unread={unread} />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
