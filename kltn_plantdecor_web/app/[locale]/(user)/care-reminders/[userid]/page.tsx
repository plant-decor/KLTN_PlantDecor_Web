import { notFound, redirect } from "next/navigation";
import { Box, Container, Stack, Typography } from "@mui/material";
import { getTranslations } from "next-intl/server";
import CareRemindersSection from "@/components/plant/CareRemindersSection";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { getMyPlants, getPlantGuideByPlantId } from "@/lib/api/myPlantService";
import type { MyPlantItemWithGuide } from "@/types/my-plant.types";

interface PageProps {
  params: Promise<{ userid: string }>;
}

export default async function CareRemindersPage({ params }: PageProps) {
  const t = await getTranslations("careRemindersPage");
  const { userid } = await params;
  const currentUser = await getCurrentUser();
  const parsedUserId = Number(userid);

  if (!Number.isFinite(parsedUserId)) {
    notFound();
  }

  if (!currentUser) {
    redirect(
      `/login?redirectTo=${encodeURIComponent(`/care-reminders/${parsedUserId}`)}`,
    );
  }

  if (currentUser.id !== parsedUserId) {
    redirect(`/care-reminders/${currentUser.id}`);
  }

  let myPlants: MyPlantItemWithGuide[] = [];

  try {
    const plants = await getMyPlants();
    const uniquePlantIds = Array.from(
      new Set(plants.map((item) => item.plantId)),
    );

    const guideResults = await Promise.allSettled(
      uniquePlantIds.map(async (plantId) => {
        const guide = await getPlantGuideByPlantId(plantId);
        return { plantId, guide };
      }),
    );

    const guideMap = new Map<number, MyPlantItemWithGuide["guide"]>();
    guideResults.forEach((result) => {
      if (result.status === "fulfilled") {
        guideMap.set(result.value.plantId, result.value.guide);
      }
    });

    myPlants = plants.map((item) => ({
      ...item,
      guide: guideMap.get(item.plantId) ?? null,
    }));
  } catch (error) {
    console.error(
      error instanceof Error ? error.message : t("errors.loadPlants"),
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 4, md: 8 } }}>
      <Stack spacing={3} sx={{ mb: 4 }}>
        <Box>
          <Typography
            variant="h3"
            fontWeight={700}
            gutterBottom
            className="font-Inter"
          >
            {t("title")}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t("description")}
          </Typography>
        </Box>
      </Stack>

      <CareRemindersSection plants={myPlants} />
    </Container>
  );
}
