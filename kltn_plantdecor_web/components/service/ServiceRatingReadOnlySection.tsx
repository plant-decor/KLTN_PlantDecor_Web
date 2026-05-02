'use client';

import { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Rating, Stack, Typography } from '@mui/material';
import { getServiceRatingByRegistration, type ServiceRatingPayload } from '@/lib/api/serviceRatingService';
import type { ServiceRegistrationRating } from '@/types/care-service.types';
import { CustomLoading } from '@/components/CustomLoading';

function isValidEmbeddedRating(r: ServiceRegistrationRating | null | undefined): r is ServiceRegistrationRating {
  return (
    !!r &&
    Number.isFinite(r.id) &&
    r.id > 0 &&
    Number.isFinite(r.score) &&
    r.score >= 1 &&
    r.score <= 5
  );
}

interface ServiceRatingReadOnlySectionProps {
  registrationId: number | null;
  /** Fetch only while dialog/page section is active */
  enabled: boolean;
  /** From `/service-registrations/my` or detail payload when GET-by-registration fails or is unavailable */
  embeddedRating?: ServiceRegistrationRating | null;
  /** Shown when rendering embedded-only (optional) */
  ratedCustomerName?: string | null;
}

export default function ServiceRatingReadOnlySection({
  registrationId,
  enabled,
  embeddedRating = null,
  ratedCustomerName = null,
}: ServiceRatingReadOnlySectionProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payload, setPayload] = useState<ServiceRatingPayload | null>(null);

  const skipFetch = useMemo(() => isValidEmbeddedRating(embeddedRating), [embeddedRating]);

  const fetchKey =
    enabled && registrationId && !skipFetch ? registrationId : null;

  const [prevFetchKey, setPrevFetchKey] = useState<number | null>(null);
  if (fetchKey !== prevFetchKey) {
    setPrevFetchKey(fetchKey);
    setPayload(null);
    setError(null);
    setLoading(fetchKey !== null);
  }

  useEffect(() => {
    if (fetchKey === null) {
      return;
    }

    let cancelled = false;

    void getServiceRatingByRegistration(fetchKey, false)
      .then((data) => {
        if (!cancelled) {
          setPayload(data);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load rating');
          setPayload(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [fetchKey]);

  if (!enabled || !registrationId) {
    return null;
  }

  if (loading) {
    return (
      <Box sx={{ py: 2, display: 'flex', justifyContent: 'center' }}>
        <CustomLoading size={20} />
      </Box>
    );
  }

  if (error && !isValidEmbeddedRating(embeddedRating)) {
    return (
      <Alert severity="error" sx={{ mt: 1 }}>
        {error}
      </Alert>
    );
  }

  if (payload) {
    const submittedAt = payload.createdAt
      ? new Date(payload.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
      : '-';

    return (
      <Stack spacing={1} sx={{ mt: 1 }}>
        <Typography variant="subtitle2" fontWeight={700}>
          Customer rating
        </Typography>
        <Rating value={payload.rating} readOnly />
        <Typography variant="body2" color="text.secondary">
          Comment
        </Typography>
        <Typography variant="body2">{payload.description?.trim() ? payload.description : '—'}</Typography>
        {payload.customer ? (
          <Typography variant="body2" color="text.secondary">
            Customer: {payload.customer.fullName}
          </Typography>
        ) : null}
        <Typography variant="caption" color="text.secondary">
          Submitted at: {submittedAt}
        </Typography>
      </Stack>
    );
  }

  if (isValidEmbeddedRating(embeddedRating)) {
    return (
      <Stack spacing={1} sx={{ mt: 1 }}>
        <Typography variant="subtitle2" fontWeight={700}>
          Customer rating
        </Typography>
        <Rating value={embeddedRating.score} readOnly />
        <Typography variant="body2" color="text.secondary">
          Comment
        </Typography>
        <Typography variant="body2">{embeddedRating.comment?.trim() ? embeddedRating.comment : '—'}</Typography>
        {ratedCustomerName ? (
          <Typography variant="body2" color="text.secondary">
            Customer: {ratedCustomerName}
          </Typography>
        ) : null}
      </Stack>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 1 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
      No rating submitted yet.
    </Typography>
  );
}
