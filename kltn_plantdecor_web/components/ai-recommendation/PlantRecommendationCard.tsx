'use client';

import { Button, Chip, Paper, Stack, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import type { RoomPlantRecommendation } from '@/types/ai-recommendation.types';
import { formatCurrency } from '@/lib/utils/formatUtil';
import { useLocale } from 'next-intl';
import { hoverLiftStyle } from '@/lib/styles/buttonStyles';

interface PlantRecommendationCardProps {
  recommendation: RoomPlantRecommendation;
  onAddToCart: (recommendation: RoomPlantRecommendation) => void;
  onBuyNow: (recommendation: RoomPlantRecommendation) => void;
}

export default function PlantRecommendationCard({
  recommendation,
  onAddToCart,
  onBuyNow,
}: PlantRecommendationCardProps) {
  const locale = useLocale();
  const t = useTranslations('aiRecommendation.recommendations');

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="h6" fontWeight="bold">
        {recommendation.name}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {recommendation.description || 'No description'}
      </Typography>

      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mb: 1 }}>
        <Chip size="small" label={recommendation.entityType} />
        <Chip size="small" label={`Price ${formatCurrency(recommendation.price || 0, locale)}`} />
      </Stack>

      {recommendation.reasonForRecommendation && (
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>{t('reason')}</strong> {recommendation.reasonForRecommendation}
        </Typography>
      )}

      {recommendation.suggestedPlacement && (
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>{t('placement')}</strong> {recommendation.suggestedPlacement}
        </Typography>
      )}

      <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
        {recommendation.entityType === 'CommonPlant' && (
          <Button
            variant="contained"
            size="small"
            onClick={() => onAddToCart(recommendation)}
            disabled={!recommendation.isPurchasable}
            sx={hoverLiftStyle}
          >
            {t('addToCartButton')}
          </Button>
        )}

        {recommendation.entityType === 'PlantInstance' && (
          <Button
            variant="outlined"
            size="small"
            onClick={() => onBuyNow(recommendation)}
            disabled={!recommendation.isPurchasable}
            sx={hoverLiftStyle}
          >
            {t('buyNowButton')}
          </Button>
        )}
      </Stack>
    </Paper>
  );
}
