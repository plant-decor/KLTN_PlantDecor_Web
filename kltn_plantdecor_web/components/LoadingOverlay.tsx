'use client';

import { useLoadingStore } from '@/store/loadingStore';
import Image from 'next/image';

/**
 * LoadingOverlay Component
 * Displays custom loading spinner using customLoading.svg
 * Controlled by axios interceptor via loadingStore
 */
export const LoadingOverlay = () => {
  const { isLoading } = useLoadingStore();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 pointer-events-none">
      <div className="rounded-lg p-8 flex flex-col items-center gap-4 pointer-events-auto">
        <Image
          src="/img/customLoading.png"
          alt="Loading..."
          width={200}
          height={200}
          className="animate-loading-spin"
          priority
        />
        <p className="text-white text-medium font-semibold">Loading...</p>
      </div>
    </div>
  );
};
