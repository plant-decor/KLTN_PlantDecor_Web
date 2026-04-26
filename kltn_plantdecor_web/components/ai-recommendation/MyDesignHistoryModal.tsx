'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useLocale, useTranslations } from 'next-intl';
import ClickableImageViewer from '@/components/image-view/ClickableImageViewer';
import { CustomLoading } from '@/components/CustomLoading';
import { getMyDesignGeneratedImages } from '@/lib/api/aiRecommendationService';
import { addItemToCart } from '@/lib/api/cartWishlistService';
import { notifyCartUpdated } from '@/lib/utils/cartEvents';
import { formatCurrency } from '@/lib/utils/formatUtil';
import type { GeneratedImageItem } from '@/types/ai-recommendation.types';

interface MyDesignHistoryModalProps {
  open: boolean;
  userId: string;
  onClose: () => void;
}

const normalizeDateText = (value: string, locale: string) => {
  const parsedTime = Date.parse(value);
  if (Number.isNaN(parsedTime)) {
    return value;
  }

  return new Date(parsedTime).toLocaleString(locale);
};

export default function MyDesignHistoryModal({ open, userId, onClose }: MyDesignHistoryModalProps) {
  const t = useTranslations('aiRecommendation.myDesign');
  const locale = useLocale();
  const localeTag = useMemo(() => (locale.startsWith('vi') ? 'vi-VN' : 'en-US'), [locale]);
  const currencyLocale = useMemo(() => (locale.startsWith('vi') ? 'vi' : 'en'), [locale]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [images, setImages] = useState<GeneratedImageItem[]>([]);
  const [addingId, setAddingId] = useState<number | null>(null);

  const loadMyDesignImages = useCallback(async () => {
    if (!userId) {
      setImages([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await getMyDesignGeneratedImages(false, false);
      const sortedItems = [...response].sort((left, right) => {
        const leftTime = Date.parse(left.createdAt);
        const rightTime = Date.parse(right.createdAt);

        const safeLeft = Number.isNaN(leftTime) ? 0 : leftTime;
        const safeRight = Number.isNaN(rightTime) ? 0 : rightTime;
        return safeRight - safeLeft;
      });

      setImages(sortedItems);
    } catch (apiError) {
      if (apiError instanceof Error) {
        setError(apiError.message);
      } else {
        setError(t('errors.loadFailed'));
      }
    } finally {
      setLoading(false);
    }
  }, [t, userId]);

  useEffect(() => {
    if (!open) {
      return;
    }

    void loadMyDesignImages();
  }, [loadMyDesignImages, open]);

  const handleAddToCart = async (item: GeneratedImageItem) => {
    try {
      setMessage(null);
      setError(null);
      setAddingId(item.id);

      const commonPlantId = item.commonPlantId ?? 0;
      if (commonPlantId <= 0) {
        setMessage({ type: 'error', text: 'Cannot add to cart because commonPlantId is missing.' });
        return;
      }

      await addItemToCart({ commonPlantId, quantity: 1 });
      notifyCartUpdated();
      setMessage({
        type: 'success',
        text: `Added ${item.name?.trim() ? item.name : 'Recommended plant'} to cart.`,
      });
    } catch (cartError) {
      const errorMessage = cartError instanceof Error ? cartError.message : 'Failed to add item to cart.';
      setMessage({ type: 'error', text: errorMessage });
      console.error('Add to cart error:', cartError);
    } finally {
      setAddingId(null);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>{t('modalTitle')}</DialogTitle>
      <DialogContent dividers>
        {message && (
          <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage(null)}>
            {message.text}
          </Alert>
        )}
        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <CustomLoading size={20} />
              <Typography variant="body2" color="text.secondary">
                {t('loading')}
              </Typography>
            </Stack>
          </Box>
        ) : error ? (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => void loadMyDesignImages()}>
                {t('retryButton')}
              </Button>
            }
          >
            {error}
          </Alert>
        ) : images.length === 0 ? (
          <Typography color="text.secondary">{t('empty')}</Typography>
        ) : (
          <Stack spacing={2.5}>
            {images.map((item) => (
              <Paper key={item.id} variant="outlined" sx={{ p: 2 }}>
                {item.imageUrl ? (
                  <ClickableImageViewer
                    images={[item.imageUrl]}
                    alt={`My design ${item.id}`}
                    className="object-cover"
                    containerClassName=""
                    showZoomHint={true}
                  />
                ) : (
                  <Alert severity="warning" sx={{ mb: 1.5 }}>
                    {t('imageMissing')}
                  </Alert>
                )}

                <Stack spacing={0.75} sx={{ mt: 1.5 }}>
                  {(item.name?.trim() || item.price != null) && (
                    <Typography variant="body2" fontWeight={600}>
                      {item.name?.trim() ? item.name : 'Recommended plant'}
                      {item.price != null ? ` • ${formatCurrency(item.price ?? 0, currencyLocale)}` : ''}
                    </Typography>
                  )}

                  <Typography variant="body2" color="text.secondary">
                    {t('generatedAt')}: {normalizeDateText(item.createdAt, localeTag)}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    {t('layoutDesignId')}: {item.layoutDesignId ?? '-'}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    {t('layoutDesignPlantId')}: {item.layoutDesignPlantId ?? '-'}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Common plant ID: {item.commonPlantId ?? '-'}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Plant instance ID: {item.plantInstanceId ?? '-'}
                  </Typography>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ pt: 0.5 }}>
                    <Button
                      variant="contained"
                      disabled={!item.commonPlantId || item.commonPlantId <= 0 || addingId === item.id}
                      onClick={() => void handleAddToCart(item)}
                      sx={{ fontWeight: 700 }}
                    >
                      {addingId === item.id ? 'Adding...' : 'Add to cart'}
                    </Button>
                  </Stack>

                  {/* <Typography
                    variant="body2"
                    title={item.fluxPromptUsed ?? ''}
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {t('promptLabel')}: {item.fluxPromptUsed?.trim() ? item.fluxPromptUsed : t('noPrompt')}
                  </Typography> */}
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('closeButton')}</Button>
      </DialogActions>
    </Dialog>
  );
}
