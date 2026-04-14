'use client';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import { useLocale, useTranslations } from 'next-intl';
import type { MyPlantItemWithGuide } from '@/types/my-plant.types';

interface MyPlantsClientProps {
  plants: MyPlantItemWithGuide[];
}

const formatDate = (value: string | null | undefined, locale: string, fallback: string) => {
  if (!value) {
    return fallback;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(locale);
};

const formatNumber = (value: number | null | undefined, fallback: string, suffix = '') => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return fallback;
  }

  return `${value}${suffix}`;
};

const getHealthChipStyles = (value?: string | null) => {
  const normalized = (value ?? '').toLowerCase();

  if (
    normalized.includes('very healthy') ||
    normalized.includes('rất khỏe') ||
    normalized.includes('rất khoẻ')
  ) {
    return { bgcolor: 'success.light', color: 'success.dark' };
  }

  if (normalized.includes('healthy') || normalized.includes('khỏe') || normalized.includes('khoẻ')) {
    return { bgcolor: 'success.light', color: 'success.dark' };
  }

  if (
    normalized.includes('need') ||
    normalized.includes('attention') ||
    normalized.includes('weak') ||
    normalized.includes('cần') ||
    normalized.includes('yếu')
  ) {
    return { bgcolor: 'warning.light', color: 'warning.dark' };
  }

  return { bgcolor: 'grey.200', color: 'text.primary' };
};

const GuideField = ({
  label,
  value,
  fallback,
}: {
  label: string;
  value?: string | number | null;
  fallback: string;
}) => (
  <Box>
    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
      {label}
    </Typography>
    <Typography variant="body2" fontWeight={600}>
      {value === null || value === undefined || value === '' ? fallback : String(value)}
    </Typography>
  </Box>
);

export default function MyPlantsClient({ plants }: MyPlantsClientProps) {
  const t = useTranslations('myPlantClient');
  const locale = useLocale();

  return (
    <Stack spacing={3}>
      {plants.map((plant) => {
        const healthStyles = getHealthChipStyles(plant.healthStatus);
        const notUpdated = t('common.notUpdated');

        return (
          <Card key={plant.id} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 4 }}>
            <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box
                    sx={{
                      borderRadius: 3,
                      overflow: 'hidden',
                      bgcolor: 'grey.100',
                      minHeight: 220,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {plant.imageUrl ? (
                      <Box
                        component="img"
                        src={plant.imageUrl}
                        alt={plant.plantName}
                        sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <Typography variant="h2" sx={{ opacity: 0.4 }}>
                        🌱
                      </Typography>
                    )}
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 8 }}>
                  <Stack spacing={2}>
                    <Box>
                      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 1.5 }}>
                        <Chip label={t('plantCode', { id: plant.id })} size="small" variant="outlined" />
                        <Chip label={plant.healthStatus || notUpdated} size="small" sx={healthStyles} />
                      </Stack>
                      <Typography variant="h5" fontWeight={800} gutterBottom>
                        {plant.plantName}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        {plant.plantSpecificName || t('common.noScientificName')}
                      </Typography>
                    </Box>

                    <Grid container spacing={2}>
                      <Grid size={{ xs: 6, sm: 4 }}>
                        <GuideField
                          label={t('fields.purchaseDate')}
                          value={formatDate(plant.purchaseDate, locale, notUpdated)}
                          fallback={notUpdated}
                        />
                      </Grid>
                      <Grid size={{ xs: 6, sm: 4 }}>
                        <GuideField label={t('fields.location')} value={plant.location || notUpdated} fallback={notUpdated} />
                      </Grid>
                      <Grid size={{ xs: 6, sm: 4 }}>
                        <GuideField
                          label={t('fields.age')}
                          value={formatNumber(plant.age, notUpdated, t('units.year'))}
                          fallback={notUpdated}
                        />
                      </Grid>
                      <Grid size={{ xs: 6, sm: 4 }}>
                        <GuideField
                          label={t('fields.trunkDiameter')}
                          value={formatNumber(plant.currentTrunkDiameter, notUpdated, t('units.cm'))}
                          fallback={notUpdated}
                        />
                      </Grid>
                      <Grid size={{ xs: 6, sm: 4 }}>
                        <GuideField
                          label={t('fields.height')}
                          value={formatNumber(plant.currentHeight, notUpdated, t('units.cm'))}
                          fallback={notUpdated}
                        />
                      </Grid>
                      <Grid size={{ xs: 6, sm: 4 }}>
                        <GuideField
                          label={t('fields.lastWatered')}
                          value={formatDate(plant.lastWateredDate, locale, notUpdated)}
                          fallback={notUpdated}
                        />
                      </Grid>
                      <Grid size={{ xs: 6, sm: 4 }}>
                        <GuideField
                          label={t('fields.lastFertilized')}
                          value={formatDate(plant.lastFertilizedDate, locale, notUpdated)}
                          fallback={notUpdated}
                        />
                      </Grid>
                      <Grid size={{ xs: 6, sm: 4 }}>
                        <GuideField
                          label={t('fields.lastPruned')}
                          value={formatDate(plant.lastPrunedDate, locale, notUpdated)}
                          fallback={notUpdated}
                        />
                      </Grid>
                    </Grid>
                  </Stack>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {plant.guide ? (
                <Accordion disableGutters elevation={0} sx={{ bgcolor: 'transparent', '&:before': { display: 'none' } }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 0 }}>
                    <Stack>
                      <Typography variant="h6" fontWeight={800}>
                        {t('guide.title', { plantName: plant.plantName })}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t('guide.subtitle', { plantName: plant.plantName })}
                      </Typography>
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: 0, pt: 0 }}>
                    <Grid container spacing={2.5}>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <GuideField
                          label={t('guide.fields.light')}
                          value={plant.guide.lightRequirementName}
                          fallback={notUpdated}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <GuideField label={t('guide.fields.watering')} value={plant.guide.watering} fallback={notUpdated} />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <GuideField label={t('guide.fields.fertilizing')} value={plant.guide.fertilizing} fallback={notUpdated} />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <GuideField label={t('guide.fields.pruning')} value={plant.guide.pruning} fallback={notUpdated} />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <GuideField label={t('guide.fields.temperature')} value={plant.guide.temperature} fallback={notUpdated} />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <GuideField label={t('guide.fields.humidity')} value={plant.guide.humidity} fallback={notUpdated} />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <GuideField label={t('guide.fields.soil')} value={plant.guide.soil} fallback={notUpdated} />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            bgcolor: 'rgba(25, 118, 210, 0.06)',
                            border: '1px solid',
                            borderColor: 'rgba(25, 118, 210, 0.20)',
                          }}
                        >
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                            {t('guide.fields.careNotes')}
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {plant.guide.careNotes || notUpdated}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              ) : (
                <Alert severity="info" sx={{ mt: 1 }}>
                  {t('guide.missing')}
                </Alert>
              )}
            </CardContent>
          </Card>
        );
      })}
    </Stack>
  );
}
