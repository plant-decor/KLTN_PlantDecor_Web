'use client';

import { useEffect } from 'react';
import { Box } from '@mui/material';
import { useRouter } from 'next/navigation';
import { CustomLoading } from '@/components/CustomLoading';
import { useAuthStore } from '@/lib/store/authStore';

export default function DesignRegistrationPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAuthBootstrapCompleted = useAuthStore((state) => state.isAuthBootstrapCompleted);

  useEffect(() => {
    if (!isAuthBootstrapCompleted) {
      return;
    }

    if (!isAuthenticated || !user?.id) {
      router.replace(`/login?redirectTo=${encodeURIComponent('/design-registration')}`);
      return;
    }

    router.replace(`/services/${user.id}?tab=design`);
  }, [isAuthBootstrapCompleted, isAuthenticated, router, user?.id]);

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
      <CustomLoading size={18} />
    </Box>
  );
}
