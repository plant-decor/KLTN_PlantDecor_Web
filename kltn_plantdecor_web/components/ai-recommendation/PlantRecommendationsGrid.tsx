'use client';

import { Box, Card, CardContent, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import type { RoomPlantRecommendation, AnalyzeRoomUploadPayload } from '@/types/ai-recommendation.types';
import PlantRecommendationCard from './PlantRecommendationCard';

interface PlantRecommendationsGridProps {
  analysisResult: AnalyzeRoomUploadPayload | null;
  onAddToCart: (recommendation: RoomPlantRecommendation, recommendationIndex: number) => void;
  onBuyNow: (recommendation: RoomPlantRecommendation, recommendationIndex: number) => void;
}

export default function PlantRecommendationsGrid({
  analysisResult,
  onAddToCart,
  onBuyNow,
}: PlantRecommendationsGridProps) {
  const t = useTranslations('aiRecommendation.recommendations');

  if (!analysisResult?.recommendations?.length) {
    return null;
  }

  return (
    <Card sx={{ mb: 3, boxShadow: 2 }}>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
          {t('titleWithCount', { count: analysisResult.totalCount })}
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          {analysisResult.recommendations.slice(0, 3).map((recommendation, index) => (
            <PlantRecommendationCard
              key={`${recommendation.entityType}-${recommendation.productId}-${index}`}
              recommendation={recommendation}
              recommendationIndex={index}
              onAddToCart={onAddToCart}
              onBuyNow={onBuyNow}
            />
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
