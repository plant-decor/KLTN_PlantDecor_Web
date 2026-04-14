import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Alert, Box, Button, Container, Stack, Typography } from '@mui/material';
import MyPlantsClient from '@/components/plant/MyPlantsClient';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { getMyPlants, getPlantGuideByPlantId } from '@/lib/api/myPlantService';
import type { MyPlantItemWithGuide } from '@/types/my-plant.types';
import { hoverLiftStyle } from '@/lib/styles/buttonStyles';

interface PageProps {
  params: Promise<{ userid: string }>;
}

export default async function MyPlantPage({ params }: PageProps) {
  const { userid } = await params;
  const currentUser = await getCurrentUser();
  const parsedUserId = Number(userid);

  if (!Number.isFinite(parsedUserId) || !currentUser || currentUser.id !== parsedUserId) {
    notFound();
  }

  let myPlants: MyPlantItemWithGuide[] = [];
  let errorMessage: string | null = null;

  try {
    const plants = await getMyPlants();
    const uniquePlantIds = Array.from(new Set(plants.map((item) => item.plantId)));

    const guideResults = await Promise.allSettled(
      uniquePlantIds.map(async (plantId) => {
        const guide = await getPlantGuideByPlantId(plantId);
        return { plantId, guide };
      })
    );

    const guideMap = new Map<number, MyPlantItemWithGuide['guide']>();
    guideResults.forEach((result) => {
      if (result.status === 'fulfilled') {
        guideMap.set(result.value.plantId, result.value.guide);
      }
    });

    myPlants = plants.map((item) => ({
      ...item,
      guide: guideMap.get(item.plantId) ?? null,
    }));
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : 'Không thể tải danh sách cây của bạn.';
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 4, md: 8 } }}>
      <Stack spacing={3} sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h3" fontWeight={800} gutterBottom>
            Cây của tôi
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Danh sách các cây bạn đã mua kèm hướng dẫn chăm sóc chi tiết cho từng loại cây.
          </Typography>
        </Box>

        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
      </Stack>

      {myPlants.length === 0 ? (
        <Box
          sx={{
            bgcolor: 'background.paper',
            borderRadius: 4,
            p: { xs: 4, md: 6 },
            textAlign: 'center',
            boxShadow: 1,
          }}
        >
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Bạn chưa có cây nào
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Hãy khám phá cửa hàng để chọn những cây phù hợp và bắt đầu chăm sóc ngay hôm nay.
          </Typography>
          <Link href="/plant-store" style={{ textDecoration: 'none' }}>
            <Button variant="contained" size="large" sx={{ fontWeight: 700, backgroundColor: 'var(--primary)', ...hoverLiftStyle }}>
              Ghé thăm cửa hàng
            </Button>
          </Link>
        </Box>
      ) : (
        <MyPlantsClient plants={myPlants} />
      )}
    </Container>
  );
}