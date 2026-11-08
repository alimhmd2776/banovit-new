/**
 * Tiny event bus for the top navigation progress bar
 * (components/loading/NavigationProgress). Link clicks are picked up
 * automatically; code that navigates with router.push/replace calls
 * startNavProgress() (see useNavRouter) so the bar shows there too.
 */
type Listener = () => void;
const startListeners = new Set<Listener>();
const doneListeners = new Set<Listener>();

export function onNavProgress(start: Listener, done: Listener): () => void {
  startListeners.add(start);
  doneListeners.add(done);
  return () => {
    startListeners.delete(start);
    doneListeners.delete(done);
  };
}

export function startNavProgress(): void {
  startListeners.forEach((fn) => fn());
}

export function doneNavProgress(): void {
  doneListeners.forEach((fn) => fn());
}

/** Shows the top bar while `work` runs (cart updates, checkout steps, …). */
export async function withProgress<T>(work: () => Promise<T>): Promise<T> {
  startNavProgress();
  try {
    return await work();
  } finally {
    doneNavProgress();
  }
}

/** True when `href` points at a different page (path or query) than the current one. */
export function isOtherPage(href: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const next = new URL(href, window.location.href);
    if (next.origin !== window.location.origin) return false;
    return next.pathname !== window.location.pathname || next.search !== window.location.search;
  } catch {
    return false;
  }
}
