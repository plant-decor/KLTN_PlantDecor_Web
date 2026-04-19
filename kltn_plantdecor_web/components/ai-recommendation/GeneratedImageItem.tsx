'use client';

import { Alert, Box, Button, Paper, Stack, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import type { GeneratedLayoutImageItem, RoomPlantRecommendation } from '@/types/ai-recommendation.types';
import ClickableImageViewer from '@/components/image-view/ClickableImageViewer';
import { hoverLiftStyle } from '@/lib/styles/buttonStyles';
import { formatCurrency } from '@/lib/utils/formatUtil';

interface GeneratedImageItemProps {
  item: GeneratedLayoutImageItem;
  recommendation: RoomPlantRecommendation | null;
  isAddingToCart: boolean;
  onAddToCart: (item: GeneratedLayoutImageItem) => Promise<void>;
}

export default function GeneratedImageItem({
  item,
  recommendation,
  isAddingToCart,
  onAddToCart,
}: GeneratedImageItemProps) {
  const locale = useLocale();
  const t = useTranslations('aiRecommendation.generatedImages');
  const recommendationT = useTranslations('aiRecommendation.recommendations');

  const canAddToCart = item.isSuccess && !!item.commonPlantId && item.commonPlantId > 0;
  const plantName = recommendation?.name ?? t('plantFallbackName');
  const plantDescription = recommendation?.description || t('plantDescriptionFallback');

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      {item.imageUrl ? (
        <Box sx={{ mb: 1.5 }}>
          <ClickableImageViewer
            images={[item.imageUrl]}
            alt={`Generated layout image ${item.layoutDesignPlantId}`}
            containerClassName=""
            className="object-cover"
            showZoomHint={true}
          />
        </Box>
      ) : (
        <Alert severity="warning" sx={{ mb: 1.5 }}>
          {t('imageFailed')}
        </Alert>
      )}

      <Typography variant="body2" sx={{ mb: 1 }}>
        <strong>{t('placementLabel')}</strong> {item.placementPosition || 'N/A'}
      </Typography>

      <Stack spacing={0.75} sx={{ mb: 1.5 }}>
        <Typography variant="subtitle1" fontWeight="bold">
          {plantName}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          {plantDescription}
        </Typography>

      </Stack>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, alignItems: 'center' }}>
        {recommendation ? (
          <Typography variant="body1">
            {t('priceLabel')} <strong>{formatCurrency(recommendation.price ?? 0, locale)}</strong>
          </Typography>
        ) : (
          <Alert severity="info">{t('plantInfoPending')}</Alert>
        )}
      <Button
        variant="contained"
        size="small"
        onClick={() => {
          void onAddToCart(item);
        }}
        disabled={!canAddToCart || isAddingToCart}
        sx={{ backgroundColor: 'var(--primary)', fontWeight: '700', ...hoverLiftStyle }}
      >
        {isAddingToCart ? t('addingToCartButton') : recommendationT('addToCartButton')}
      </Button>
      </Box>

      {!item.isSuccess && item.errorMessage && (
        <Alert severity="error" sx={{ mt: 1.5 }}>
          {item.errorMessage}
        </Alert>
      )}
    </Paper>
  );
}
