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
import type { MyPlantItemWithGuide } from '@/types/my-plant.types';

interface MyPlantsClientProps {
  plants: MyPlantItemWithGuide[];
}

const formatDate = (value?: string | null) => {
  if (!value) {
    return 'Chưa cập nhật';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('vi-VN');
};

const formatNumber = (value?: number | null, suffix = '') => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return 'Chưa cập nhật';
  }

  return `${value}${suffix}`;
};

const getHealthChipStyles = (value?: string | null) => {
  const normalized = (value ?? '').toLowerCase();

  if (normalized.includes('rất khỏe') || normalized.includes('rất khoẻ')) {
    return { bgcolor: 'success.light', color: 'success.dark' };
  }

  if (normalized.includes('khỏe') || normalized.includes('khoẻ')) {
    return { bgcolor: 'success.light', color: 'success.dark' };
  }

  if (normalized.includes('cần') || normalized.includes('yếu')) {
    return { bgcolor: 'warning.light', color: 'warning.dark' };
  }

  return { bgcolor: 'grey.200', color: 'text.primary' };
};

const GuideField = ({ label, value }: { label: string; value?: string | number | null }) => (
  <Box>
    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
      {label}
    </Typography>
    <Typography variant="body2" fontWeight={600}>
      {value === null || value === undefined || value === '' ? 'Chưa cập nhật' : String(value)}
    </Typography>
  </Box>
);

export default function MyPlantsClient({ plants }: MyPlantsClientProps) {
  return (
    <Stack spacing={3}>
      {plants.map((plant) => {
        const healthStyles = getHealthChipStyles(plant.healthStatus);

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
                        <Chip label={`Mã cây #${plant.id}`} size="small" variant="outlined" />
                        <Chip label={plant.healthStatus || 'Chưa cập nhật'} size="small" sx={healthStyles} />
                      </Stack>
                      <Typography variant="h5" fontWeight={800} gutterBottom>
                        {plant.plantName}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        {plant.plantSpecificName || 'Chưa có tên khoa học'}
                      </Typography>
                    </Box>

                    <Grid container spacing={2}>
                      <Grid size={{ xs: 6, sm: 4 }}>
                        <GuideField label="Ngày mua" value={formatDate(plant.purchaseDate)} />
                      </Grid>
                      <Grid size={{ xs: 6, sm: 4 }}>
                        <GuideField label="Vị trí" value={plant.location || 'Chưa cập nhật'} />
                      </Grid>
                      <Grid size={{ xs: 6, sm: 4 }}>
                        <GuideField label="Tuổi cây" value={formatNumber(plant.age, ' năm')} />
                      </Grid>
                      <Grid size={{ xs: 6, sm: 4 }}>
                        <GuideField label="Đường kính thân" value={formatNumber(plant.currentTrunkDiameter, ' cm')} />
                      </Grid>
                      <Grid size={{ xs: 6, sm: 4 }}>
                        <GuideField label="Chiều cao" value={formatNumber(plant.currentHeight, ' cm')} />
                      </Grid>
                      <Grid size={{ xs: 6, sm: 4 }}>
                        <GuideField label="Tưới gần nhất" value={formatDate(plant.lastWateredDate)} />
                      </Grid>
                      <Grid size={{ xs: 6, sm: 4 }}>
                        <GuideField label="Bón phân gần nhất" value={formatDate(plant.lastFertilizedDate)} />
                      </Grid>
                      <Grid size={{ xs: 6, sm: 4 }}>
                        <GuideField label="Cắt tỉa gần nhất" value={formatDate(plant.lastPrunedDate)} />
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
                        {`Hướng dẫn chăm sóc cho ${plant.plantName}`}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Hướng dẫn chăm sóc chi tiết cho {plant.plantName}
                      </Typography>
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: 0, pt: 0 }}>
                    <Grid container spacing={2.5}>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <GuideField label="Ánh sáng" value={plant.guide.lightRequirementName} />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <GuideField label="Tưới nước" value={plant.guide.watering} />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <GuideField label="Bón phân" value={plant.guide.fertilizing} />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <GuideField label="Cắt tỉa" value={plant.guide.pruning} />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <GuideField label="Nhiệt độ" value={plant.guide.temperature} />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <GuideField label="Độ ẩm" value={plant.guide.humidity} />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <GuideField label="Đất trồng" value={plant.guide.soil} />
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
                            Ghi chú chăm sóc
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {plant.guide.careNotes}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              ) : (
                <Alert severity="info" sx={{ mt: 1 }}>
                  Cây này chưa có plant guide. Hãy quay lại sau hoặc liên hệ hỗ trợ nếu bạn cần hướng dẫn chi tiết.
                </Alert>
              )}
            </CardContent>
          </Card>
        );
      })}
    </Stack>
  );
}
