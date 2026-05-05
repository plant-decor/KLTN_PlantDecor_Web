'use client';

import { useEffect, useRef } from 'react';
import { ADMIN_DATA_POLL_INTERVAL_MS } from '@/lib/constants/adminDataRefresh';

/**
 * Refetches on a fixed interval while the component is mounted.
 * Skips a tick if `loading` is true to avoid overlapping in-flight requests.
 */
export function useAdminDataPolling(
  onPoll: () => void | Promise<void>,
  loading: boolean,
  enabled = true
): void {
  const pollRef = useRef(onPoll);
  const loadingRef = useRef(loading);

  useEffect(() => {
    pollRef.current = onPoll;
    loadingRef.current = loading;
  }, [onPoll, loading]);

  useEffect(() => {
    if (!enabled) return;

    const id = window.setInterval(() => {
      if (loadingRef.current) return;
      void pollRef.current();
    }, ADMIN_DATA_POLL_INTERVAL_MS);

    return () => window.clearInterval(id);
  }, [enabled]);
}
