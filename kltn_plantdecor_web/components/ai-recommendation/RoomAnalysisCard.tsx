'use client';

import { Box, Card, CardContent, Chip, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import type { AnalyzeRoomUploadPayload } from '@/types/ai-recommendation.types';

interface RoomAnalysisCardProps {
  analysisResult: AnalyzeRoomUploadPayload;
}

export default function RoomAnalysisCard({ analysisResult }: RoomAnalysisCardProps) {
  const t = useTranslations('aiRecommendation.roomAnalysis');

  return (
    <Card sx={{ mb: 3, boxShadow: 2 }}>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
          {t('title')}
        </Typography>
        <Typography variant="body1" sx={{ mb: 1.5 }}>
          {analysisResult.roomAnalysis.summary}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {analysisResult.roomAnalysis.colorPalette.map((color) => (
            <Chip key={color} size="small" label={color} />
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
