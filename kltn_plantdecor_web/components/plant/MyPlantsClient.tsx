"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import type {
  MyPlantItemWithGuide,
  MyPlantUpdateRequest,
} from "@/types/my-plant.types";
import { localizeRoomDesignEnumLabel } from "@/lib/utils/roomDesignEnumI18n";
import { useUpdateMyPlant } from "@/hooks/useUpdateMyPlant";
import ClickableImageViewer from "../image-view/ClickableImageViewer";

interface MyPlantsClientProps {
  plants: MyPlantItemWithGuide[];
}

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

type MyPlantFormState = {
  location: string;
  currentTrunkDiameter: string;
  currentHeight: string;
  healthStatus: string;
  age: string;
};

const toDateOnly = (value: string | null | undefined) => {
  if (!value) {
    return new Date().toISOString().slice(0, 10);
  }

  return value.slice(0, 10);
};

const toFormState = (plant: MyPlantItemWithGuide): MyPlantFormState => ({
  location: plant.location ?? "",
  currentTrunkDiameter:
    plant.currentTrunkDiameter === null ||
    plant.currentTrunkDiameter === undefined
      ? ""
      : String(plant.currentTrunkDiameter),
  currentHeight:
    plant.currentHeight === null || plant.currentHeight === undefined
      ? ""
      : String(plant.currentHeight),
  healthStatus: plant.healthStatus ?? "",
  age: plant.age === null || plant.age === undefined ? "" : String(plant.age),
});

const toNumberOrZero = (value: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
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
  const [items, setItems] = useState<MyPlantItemWithGuide[]>(plants);
  const [editingPlant, setEditingPlant] = useState<MyPlantItemWithGuide | null>(
    null,
  );
  const [form, setForm] = useState<MyPlantFormState | null>(null);
  const { updatePlant, isSaving } = useUpdateMyPlant();

  useEffect(() => {
    setItems(plants);
  }, [plants]);

  const isDialogOpen = Boolean(editingPlant && form);

  const editTitle = useMemo(() => {
    if (!editingPlant) {
      return t("editDialog.title");
    }

    return t("editDialog.titleWithName", { plantName: editingPlant.plantName });
  }, [editingPlant, t]);

  const handleOpenEdit = (plant: MyPlantItemWithGuide) => {
    setEditingPlant(plant);
    setForm(toFormState(plant));
  };

  const handleCloseEdit = () => {
    if (isSaving) {
      return;
    }

    setEditingPlant(null);
    setForm(null);
  };

  const handleFormChange = (field: keyof MyPlantFormState, value: string) => {
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleSubmitEdit = async () => {
    if (!editingPlant || !form) {
      return;
    }

    const request: MyPlantUpdateRequest = {
      purchaseDate: toDateOnly(editingPlant.purchaseDate),
      lastWateredDate: toDateOnly(editingPlant.lastWateredDate),
      lastFertilizedDate: toDateOnly(editingPlant.lastFertilizedDate),
      lastPrunedDate: toDateOnly(editingPlant.lastPrunedDate),
      location: form.location.trim(),
      currentTrunkDiameter: toNumberOrZero(form.currentTrunkDiameter),
      currentHeight: toNumberOrZero(form.currentHeight),
      healthStatus: form.healthStatus.trim(),
      age: toNumberOrZero(form.age),
    };

    const result = await updatePlant(editingPlant.id, request);

    if (!result.success || !result.item) {
      toast.error(result.message ?? t("editDialog.error"));
      return;
    }

    setItems((prev) =>
      prev.map((plant) =>
        plant.id === editingPlant.id
          ? {
              ...plant,
              ...result.item,
              guide: plant.guide,
            }
          : plant,
      ),
    );
    toast.success(result.message ?? t("editDialog.success"));
    handleCloseEdit();
  };

  return (
    <Stack spacing={3}>
      {items.map((plant) => {
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
                        alignItems="center"
                        justifyContent="space-between"
                        useFlexGap
                        flexWrap="wrap"
                        sx={{ mb: 1.5 }}
                      >
                        <Stack
                          direction="row"
                          spacing={1}
                          useFlexGap
                          flexWrap="wrap"
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
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<EditIcon fontSize="small" />}
                          onClick={() => handleOpenEdit(plant)}
                        >
                          {t("actions.edit")}
                        </Button>
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

      <Dialog
        open={isDialogOpen}
        onClose={handleCloseEdit}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{editTitle}</DialogTitle>
        <DialogContent>
          {form ? (
            <Grid container spacing={2} sx={{ pt: 1 }}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label={t("fields.location")}
                  value={form.location}
                  onChange={(event) =>
                    handleFormChange("location", event.target.value)
                  }
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label={t("fields.age")}
                  value={form.age}
                  onChange={(event) =>
                    handleFormChange("age", event.target.value)
                  }
                  type="number"
                  slotProps={{ htmlInput: { min: 0 } }}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label={t("fields.height")}
                  value={form.currentHeight}
                  onChange={(event) =>
                    handleFormChange("currentHeight", event.target.value)
                  }
                  type="number"
                  slotProps={{ htmlInput: { min: 0, step: "0.1" } }}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label={t("fields.trunkDiameter")}
                  value={form.currentTrunkDiameter}
                  onChange={(event) =>
                    handleFormChange("currentTrunkDiameter", event.target.value)
                  }
                  type="number"
                  slotProps={{ htmlInput: { min: 0, step: "0.1" } }}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label={t("fields.healthStatus")}
                  value={form.healthStatus}
                  onChange={(event) =>
                    handleFormChange("healthStatus", event.target.value)
                  }
                  fullWidth
                />
              </Grid>
            </Grid>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={handleCloseEdit}
            disabled={isSaving}
            startIcon={<CloseIcon fontSize="small" />}
          >
            {t("actions.cancel")}
          </Button>
          <Button
            onClick={handleSubmitEdit}
            disabled={isSaving}
            variant="contained"
            startIcon={<SaveIcon fontSize="small" />}
          >
            {isSaving ? t("actions.saving") : t("actions.save")}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
