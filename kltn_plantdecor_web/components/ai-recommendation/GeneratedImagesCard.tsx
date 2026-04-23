'use client';

import { Box, Button, Card, CardContent, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import type {
  AnalyzeRoomUploadPayload,
  GeneratedLayoutImageItem,
  GenerateLayoutImagesPayload,
  RoomPlantRecommendation,
} from '@/types/ai-recommendation.types';
import GeneratedImageItem from './GeneratedImageItem';
import { hoverLiftStyle } from '@/lib/styles/buttonStyles';
import { CustomLoading } from '../CustomLoading';

interface GeneratedImagesCardProps {
  isGenerating: boolean;
  generateResult: GenerateLayoutImagesPayload | null;
  analysisResult: AnalyzeRoomUploadPayload | null;
  resolveRecommendationFromGeneratedItem: (item: GeneratedLayoutImageItem) => RoomPlantRecommendation | null;
  addingLayoutDesignPlantId: number | null;
  onAddToCart: (item: GeneratedLayoutImageItem) => Promise<void>;
  onRetryGenerate: () => void;
}

export default function GeneratedImagesCard({
  isGenerating,
  generateResult,
  analysisResult,
  resolveRecommendationFromGeneratedItem,
  addingLayoutDesignPlantId,
  onAddToCart,
  onRetryGenerate,
}: GeneratedImagesCardProps) {
  const t = useTranslations('aiRecommendation.generatedImages');

  if (!isGenerating && !generateResult) {
    return null;
  }

  return (
    <Card sx={{ boxShadow: 2 }}>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
          {t('title')}
        </Typography>

        {isGenerating && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <CustomLoading size={20} />
            <Typography variant="body2" color="text.secondary">
              {t('generatingLabel')}
            </Typography>
          </Box>
        )}

        {generateResult && (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('successCount', { success: generateResult.successCount, total: generateResult.totalItems, failed: generateResult.failureCount })}
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              {generateResult.items.map((item) => (
                <GeneratedImageItem
                  key={item.layoutDesignPlantId}
                  item={item}
                  recommendation={resolveRecommendationFromGeneratedItem(item)}
                  isAddingToCart={addingLayoutDesignPlantId === item.layoutDesignPlantId}
                  onAddToCart={onAddToCart}
                />
              ))}
            </Box>

            {analysisResult?.layoutDesignId ? (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={onRetryGenerate}
                  disabled={isGenerating}
                  sx={{ backgroundColor: 'var(--error)', fontWeight: '700', ...hoverLiftStyle }}
                >
                  {t('retryButton')}
                </Button>
              </Box>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
