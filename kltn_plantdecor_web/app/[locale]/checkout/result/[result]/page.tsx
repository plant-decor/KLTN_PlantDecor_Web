'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  Paper,
  Container,
  CircularProgress,
  Divider,
  Fade,
} from '@mui/material';
import { Cancel, CheckCircle, HistoryOutlined, Home } from '@mui/icons-material';
import { useAuthStore } from '@/lib/store/authStore';
import { routing } from '@/i18n/routing';

function buildLocalizedPath(locale: string, path: string): string {
  return locale === routing.defaultLocale ? path : `/${locale}${path}`;
}

export default function CheckoutResultPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const locale = params.locale;
  const result = params.result;

  const [countdown, setCountdown] = useState(5);
  const user = useAuthStore((state) => state.user);
  const userId = user?.id ? String(user.id) : null;

  const resolvedLocale = useMemo(() => {
    if (Array.isArray(locale)) {
      return locale[0] ?? routing.defaultLocale;
    }
    return locale ?? routing.defaultLocale;
  }, [locale]);

  const normalizedResult = useMemo(() => {
    if (Array.isArray(result)) {
      return result[0] ?? 'fail';
    }
    return result ?? 'fail';
  }, [result]);

  const isSuccess = normalizedResult === 'success';

  const targetPath = useMemo(() => {
    const orderPath = userId ? `/orders/${userId}` : '/orders';
    return buildLocalizedPath(resolvedLocale, orderPath);
  }, [resolvedLocale, userId]);

  useEffect(() => {
    const responseCode = searchParams.get('vnp_ResponseCode');
    const transactionStatus = searchParams.get('vnp_TransactionStatus');
    const hasQueryParams = Array.from(searchParams.keys()).length > 0;

    if (!hasQueryParams) {
      return;
    }

    const paymentResult =
      responseCode === '00' && (transactionStatus === '00' || transactionStatus === null)
        ? 'success'
        : 'fail';

    const cleanPath = buildLocalizedPath(resolvedLocale, `/checkout/result/${paymentResult}`);

    if (cleanPath !== window.location.pathname) {
      router.replace(cleanPath);
      return;
    }

    window.history.replaceState({}, '', cleanPath);
  }, [resolvedLocale, router, searchParams]);

  const handleRedirect = () => {
    router.push(targetPath);
  };

  useEffect(() => {
    if (countdown <= 0) {
      router.push(targetPath);
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, targetPath, router]);

  return (
    <Container maxWidth="sm" className="py-12">
      <Fade in timeout={800}>
        <Paper
          elevation={3}
          className="p-8 text-center rounded-2xl border-t-8"
          style={{ borderColor: isSuccess ? '#2e7d32' : '#d32f2f' }}
        >
          <Box className="flex flex-col items-center mb-6">
            {isSuccess ? (
              <CheckCircle sx={{ color: '#2e7d32', width: 80, height: 80 }} />
            ) : (
              <Cancel sx={{ color: '#d32f2f', width: 80, height: 80 }} />
            )}
            <Typography variant="h4" className="mt-4 font-bold text-slate-800">
              {isSuccess ? 'Thanh toan thanh cong!' : 'Thanh toan that bai'}
            </Typography>
          </Box>

          <Typography variant="body1" color="textSecondary" className="mb-6 px-4">
            {isSuccess
              ? 'Cam on ban! Don hang cua ban dang duoc xu ly.'
              : 'Da co loi xay ra trong qua trinh thanh toan. Vui long thu lai.'}
          </Typography>

          <Box className="relative inline-flex items-center justify-center mb-8">
            <CircularProgress
              variant="determinate"
              value={(countdown / 5) * 100}
              color={isSuccess ? 'success' : 'error'}
              size={60}
            />
            <Box className="absolute flex flex-col items-center justify-center">
              <Typography variant="caption" component="div" className="font-bold text-slate-700">
                {countdown}s
              </Typography>
            </Box>
          </Box>

          <Typography variant="body2" className="text-slate-400 italic mb-8">
            He thong se tu dong chuyen ve trang don hang sau {countdown} giay...
          </Typography>

          <Divider className="mb-8" />

          <Box className="flex flex-col gap-3">
            <Button
              variant="contained"
              fullWidth
              size="large"
              startIcon={<HistoryOutlined sx={{ width: 18, height: 18 }} />}
              onClick={handleRedirect}
              style={{
                backgroundColor: isSuccess ? '#2e7d32' : '#1976d2',
                borderRadius: '12px',
                padding: '12px',
              }}
              className="hover:opacity-90 shadow-lg"
            >
              Xem lich su don hang ngay
            </Button>

            <Button
              variant="text"
              color="inherit"
              startIcon={<Home sx={{ width: 18, height: 18 }} />}
              onClick={() => router.push(buildLocalizedPath(resolvedLocale, '/'))}
              className="text-slate-500 normal-case"
            >
              Quay lai trang chu
            </Button>
          </Box>
        </Paper>
      </Fade>
    </Container>
  );
}
