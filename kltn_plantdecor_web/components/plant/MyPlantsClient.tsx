"use client";

import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  Typography,
  Alert,
} from "@mui/material";
import { useTranslations } from "next-intl";
import type { MyPlantItemWithGuide } from "@/types/my-plant.types";
import { formatDate as formatDateUTC7 } from "@/lib/utils/dateUtils";
import { localizeRoomDesignEnumLabel } from "@/lib/utils/roomDesignEnumI18n";
import ClickableImageViewer from "../image-view/ClickableImageViewer";

interface MyPlantsClientProps {
  plants: MyPlantItemWithGuide[];
}

const formatDate = (value: string | null | undefined, fallback: string) => {
  if (!value) {
    return fallback;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return formatDateUTC7(date);
};

const formatNumber = (
  value: number | null | undefined,
  fallback: string,
  suffix = "",
) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return fallback;
  }

  return `${value}${suffix}`;
};

const getHealthChipStyles = (value?: string | null) => {
  const normalized = (value ?? "").toLowerCase();

  if (
    normalized.includes("very healthy") ||
    normalized.includes("rất khỏe") ||
    normalized.includes("rất khoẻ")
  ) {
    return { bgcolor: "success.light", color: "success.contrastText" };
  }

  if (
    normalized.includes("healthy") ||
    normalized.includes("khỏe") ||
    normalized.includes("khoẻ")
  ) {
    return { bgcolor: "success.light", color: "success.contrastText" };
  }

  if (
    normalized.includes("need") ||
    normalized.includes("attention") ||
    normalized.includes("weak") ||
    normalized.includes("cần") ||
    normalized.includes("yếu")
  ) {
    return { bgcolor: "warning.light", color: "warning.contrastText" };
  }

  return { bgcolor: "grey.200", color: "text.primary" };
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
    <Typography
      variant="body2"
      color="text.secondary"
      sx={{ display: "block", mb: 0.75, fontWeight: 600, lineHeight: 1.35 }}
    >
      {label}
    </Typography>
    <Typography variant="body1" fontWeight={600} sx={{ lineHeight: 1.5 }}>
      {value === null || value === undefined || value === ""
        ? fallback
        : String(value)}
    </Typography>
  </Box>
);

export default function MyPlantsClient({ plants }: MyPlantsClientProps) {
  const t = useTranslations("myPlantClient");
  const tRoomDesignEnum = useTranslations("roomDesignEnums");

  return (
    <Stack spacing={3}>
      {plants.map((plant) => {
        const healthStyles = getHealthChipStyles(plant.healthStatus);
        const notUpdated = t("common.notUpdated");

        return (
          <Card
            key={plant.id}
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 4,
            }}
          >
            <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box
                    sx={{
                      borderRadius: 3,
                      overflow: "hidden",
                      bgcolor: "grey.100",
                      minHeight: 220,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {plant.primaryImageUrl ? (
                      <ClickableImageViewer
                        images={[plant.primaryImageUrl]}
                        alt={`${plant.plantName}`}
                        containerClassName="w-full"
                        className="object-cover"
                        showZoomHint={true}
                      />
                    ) : (
                      <ClickableImageViewer
                        images={["/img/fallbackplant.avif"]}
                        alt={plant.plantName}
                        containerClassName="w-full"
                        className="w-full aspect-square object-cover"
                      />
                    )}
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 8 }}>
                  <Stack spacing={2}>
                    <Box>
                      <Stack
                        direction="row"
                        spacing={1}
                        useFlexGap
                        flexWrap="wrap"
                        sx={{ mb: 1.5 }}
                      >
                        <Chip
                          label={t("plantCode", { id: plant.id })}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={plant.healthStatus || notUpdated}
                          size="small"
                          sx={healthStyles}
                        />
                      </Stack>
                      <Typography variant="h5" fontWeight={700} gutterBottom>
                        {plant.plantName}
                      </Typography>
                      <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ fontStyle: "italic" }}
                      >
                        {plant.plantSpecificName ||
                          t("common.noScientificName")}
                      </Typography>
                    </Box>

                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 3,
                            border: "1px solid",
                            borderColor: "divider",
                            bgcolor: "background.default",
                            height: "100%",
                          }}
                        >
                          <Stack spacing={1.5}>
                            <GuideField
                              label={t("fields.purchaseDate")}
                              value={formatDate(plant.purchaseDate, notUpdated)}
                              fallback={notUpdated}
                            />
                            <GuideField
                              label={t("fields.location")}
                              value={plant.location || notUpdated}
                              fallback={notUpdated}
                            />
                            <GuideField
                              label={t("fields.age")}
                              value={formatNumber(
                                plant.age,
                                notUpdated,
                                t("units.year"),
                              )}
                              fallback={notUpdated}
                            />
                            <GuideField
                              label={t("fields.height")}
                              value={formatNumber(
                                plant.currentHeight,
                                notUpdated,
                                t("units.cm"),
                              )}
                              fallback={notUpdated}
                            />
                          </Stack>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 3,
                            border: "1px solid",
                            borderColor: "divider",
                            bgcolor: "background.default",
                            height: "100%",
                          }}
                        >
                          <Stack spacing={1.5}>
                            <GuideField
                              label={t("fields.trunkDiameter")}
                              value={formatNumber(
                                plant.currentTrunkDiameter,
                                notUpdated,
                                t("units.cm"),
                              )}
                              fallback={notUpdated}
                            />
                            <GuideField
                              label={t("fields.lastWatered")}
                              value={formatDate(
                                plant.lastWateredDate,
                                notUpdated,
                              )}
                              fallback={notUpdated}
                            />
                            <GuideField
                              label={t("fields.lastFertilized")}
                              value={formatDate(
                                plant.lastFertilizedDate,
                                notUpdated,
                              )}
                              fallback={notUpdated}
                            />
                            <GuideField
                              label={t("fields.lastPruned")}
                              value={formatDate(
                                plant.lastPrunedDate,
                                notUpdated,
                              )}
                              fallback={notUpdated}
                            />
                          </Stack>
                        </Box>
                      </Grid>
                    </Grid>
                  </Stack>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {plant.guide ? (
                <Stack spacing={2}>
                  <Stack spacing={0.5}>
                    <Typography variant="h6" fontWeight={750}>
                      {t("guide.title", { plantName: plant.plantName })}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t("guide.subtitle", { plantName: plant.plantName })}
                    </Typography>
                  </Stack>

                  <Grid container spacing={1.5}>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <Box
                        sx={{
                          p: 1.75,
                          borderRadius: 2.5,
                          border: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        <GuideField
                          label={t("guide.fields.light")}
                          value={localizeRoomDesignEnumLabel(
                            plant.guide.lightRequirementName,
                            tRoomDesignEnum,
                            "LightRequirement",
                          )}
                          fallback={notUpdated}
                        />
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <Box
                        sx={{
                          p: 1.75,
                          borderRadius: 2.5,
                          border: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        <GuideField
                          label={t("guide.fields.watering")}
                          value={plant.guide.watering}
                          fallback={notUpdated}
                        />
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <Box
                        sx={{
                          p: 1.75,
                          borderRadius: 2.5,
                          border: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        <GuideField
                          label={t("guide.fields.fertilizing")}
                          value={plant.guide.fertilizing}
                          fallback={notUpdated}
                        />
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <Box
                        sx={{
                          p: 1.75,
                          borderRadius: 2.5,
                          border: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        <GuideField
                          label={t("guide.fields.pruning")}
                          value={plant.guide.pruning}
                          fallback={notUpdated}
                        />
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <Box
                        sx={{
                          p: 1.75,
                          borderRadius: 2.5,
                          border: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        <GuideField
                          label={t("guide.fields.temperature")}
                          value={plant.guide.temperature}
                          fallback={notUpdated}
                        />
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <Box
                        sx={{
                          p: 1.75,
                          borderRadius: 2.5,
                          border: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        <GuideField
                          label={t("guide.fields.humidity")}
                          value={plant.guide.humidity}
                          fallback={notUpdated}
                        />
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <Box
                        sx={{
                          p: 1.75,
                          borderRadius: 2.5,
                          border: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        <GuideField
                          label={t("guide.fields.soil")}
                          value={plant.guide.soil}
                          fallback={notUpdated}
                        />
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Box
                        sx={{
                          p: 2.25,
                          borderRadius: 2.5,
                          bgcolor: "action.hover",
                          border: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            display: "block",
                            mb: 0.75,
                            fontWeight: 600,
                            lineHeight: 1.35,
                          }}
                        >
                          {t("guide.fields.careNotes")}
                        </Typography>
                        <Typography
                          variant="body1"
                          fontWeight={600}
                          sx={{ lineHeight: 1.6 }}
                        >
                          {plant.guide.careNotes || notUpdated}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Stack>
              ) : (
                <Alert severity="info" sx={{ mt: 1 }}>
                  {t("guide.missing")}
                </Alert>
              )}
            </CardContent>
          </Card>
        );
      })}
    </Stack>
  );
}
