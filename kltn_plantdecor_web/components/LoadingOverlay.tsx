'use client';

import { useLoadingStore } from '@/lib/store/zustand';

/**
 * LoadingOverlay Component
 * Displays custom leaf loading animation
 * Controlled by axios interceptor via loadingStore
 */
export const LoadingOverlay = () => {
  const { loading } = useLoadingStore();

  if (!loading) return null;

  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-9999 flex items-center justify-center">
      <div className="loader-wrap">
        <div className="loader">
          <span className="leaf" style={{ '--i': 0 } as React.CSSProperties}></span>
          <span className="leaf" style={{ '--i': 1 } as React.CSSProperties}></span>
          <span className="leaf" style={{ '--i': 2 } as React.CSSProperties}></span>
          <span className="leaf" style={{ '--i': 3 } as React.CSSProperties}></span>
          <span className="leaf" style={{ '--i': 4 } as React.CSSProperties}></span>
          <span className="leaf" style={{ '--i': 5 } as React.CSSProperties}></span>
          <span className="leaf" style={{ '--i': 6 } as React.CSSProperties}></span>
          <span className="leaf" style={{ '--i': 7 } as React.CSSProperties}></span>
          <span className="leaf" style={{ '--i': 8 } as React.CSSProperties}></span>
          <span className="leaf" style={{ '--i': 9 } as React.CSSProperties}></span>
        </div>
      </div>
    </div>
  );
};
