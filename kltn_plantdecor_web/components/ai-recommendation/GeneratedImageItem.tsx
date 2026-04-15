'use client';

import { Alert, Box, Paper, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import ClickableImageViewer from '@/components/image-view/ClickableImageViewer';
import type { GeneratedLayoutImageItem } from '@/types/ai-recommendation.types';

interface GeneratedImageItemProps {
  item: GeneratedLayoutImageItem;
}

export default function GeneratedImageItem({ item }: GeneratedImageItemProps) {
  const t = useTranslations('aiRecommendation.generatedImages');

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

      {!item.isSuccess && item.errorMessage && (
        <Alert severity="error" sx={{ mt: 1.5 }}>
          {item.errorMessage}
        </Alert>
      )}
    </Paper>
  );
}
