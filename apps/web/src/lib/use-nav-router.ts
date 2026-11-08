'use client';

import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { isOtherPage, startNavProgress } from './nav-progress';

/** useRouter() whose push/replace also start the top progress bar. */
export function useNavRouter(): ReturnType<typeof useRouter> {
  const router = useRouter();
  return useMemo(
    () => ({
      ...router,
      push: (href, options) => {
        if (isOtherPage(href)) startNavProgress();
        router.push(href, options);
      },
      replace: (href, options) => {
        if (isOtherPage(href)) startNavProgress();
        router.replace(href, options);
      },
      back: () => {
        startNavProgress();
        router.back();
      },
    }),
    [router],
  );
}
