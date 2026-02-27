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
      <div className="bg-white rounded-lg p-8 flex flex-col items-center gap-4 pointer-events-auto">
        <Image
          src="/img/customLoading.svg"
          alt="Loading..."
          width={80}
          height={80}
          priority
        />
        <p className="text-gray-600 text-sm font-medium">Loading...</p>
      </div>
    </div>
  );
};
