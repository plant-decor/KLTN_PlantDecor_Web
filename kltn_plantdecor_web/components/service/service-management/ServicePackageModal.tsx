import React from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
  Chip,
} from "@mui/material";
import type {
  AdminCareServicePackageDetail,
  AdminSpecializationOption,
  CareServiceTypeOption,
} from "@/types/admin-service-package.types";
import type { CategoryResponse } from "@/lib/api/categoriesService";
import type { EnumOption } from "@/types/care-service.types";
import { MAX_VISITS_PER_WEEK, type ModalMode, type ServicePackageFormValue } from "./types";
import { CustomLoading } from "@/components/CustomLoading";
import { formatCurrency, formatCurrencyInput, parseCurrencyInput } from "@/lib/utils/formatUtil";

interface ServicePackageModalProps {
  open: boolean;
  mode: ModalMode;
  packageId: number | null;
  detail: AdminCareServicePackageDetail | null;
  detailLoading: boolean;
  detailError: string | null;
  formValue: ServicePackageFormValue;
  serviceTypeOptions: CareServiceTypeOption[];
  specializationOptions: AdminSpecializationOption[];
  categoryOptions: CategoryResponse[];
  careLevelOptions: EnumOption[];
  submitting: boolean;
  onClose: () => void;
  onFormChange: (updater: (prev: ServicePackageFormValue) => ServicePackageFormValue) => void;
  onSubmit: () => Promise<void>;
  onRequestEdit?: () => void;
}

export default function ServicePackageModal({
  open,
  mode,
  packageId,
  detail,
  detailLoading,
  detailError,
  formValue,
  serviceTypeOptions,
  specializationOptions,
  categoryOptions,
  careLevelOptions,
  submitting,
  onClose,
  onFormChange,
  onSubmit,
  onRequestEdit,
}: ServicePackageModalProps) {
  const isView = mode === "view";
  const isCreate = mode === "create";
  const canEditSpecializations = !isView;
  const serviceTypeLabel =
    serviceTypeOptions.find((option) => option.value === formValue.serviceType)?.label ?? String(formValue.serviceType);
  const isServiceTypeFixed = formValue.serviceType === 1;
  const isCategoryDisabled = formValue.careDifficultyLevels.length > 0;
  const isCareLevelDisabled = formValue.categoryIds.length > 0;

  const title = isCreate
    ? "Create New Service Package"
    : mode === "edit"
      ? `Update Package #${packageId ?? ""}`
      : `Package Details #${packageId ?? ""}`;

  const handleChangeField = <K extends keyof ServicePackageFormValue>(
    field: K,
    value: ServicePackageFormValue[K]
  ) => {
    onFormChange((prev) => ({ ...prev, [field]: value }));
  };

  const readonlySpecializations = detail?.specializations ?? [];
  const readonlySuitabilityRules = detail?.suitabilityRules ?? [];

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const selectMenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 5 + ITEM_PADDING_TOP,
      },
    },
  } as const;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        {detailLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CustomLoading size={18} />
          </Box>
        ) : detailError ? (
          <Alert severity="error">{detailError}</Alert>
        ) : (
          <Stack spacing={1} sx={{ pt: 1 }}>
            {isView ? (
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>Package Name: <span className="font-normal">{detail?.name || "-"}</span></Typography> 
              </Box>
            ) : (
              <TextField
                label="Package Name"
                value={formValue.name}
                onChange={(event) => handleChangeField("name", event.target.value)}
                disabled={submitting}
                fullWidth
                required
              />
            )}

            {isView ? (
              <Box>
                <Typography fontWeight={600}>Description</Typography>
                <Typography variant="body2" whiteSpace="pre-line">
                  {detail?.description || "-"}
                </Typography>
              </Box>
            ) : (
              <TextField
                label="Description"
                value={formValue.description}
                onChange={(event) => handleChangeField("description", event.target.value)}
                disabled={submitting}
                fullWidth
                multiline
                minRows={2}
                required
              />
            )}

            {isView ? (
              <Box>
                <Typography fontWeight={600}>Job Content</Typography>
                <Typography variant="body2" whiteSpace="pre-line">
                  {detail?.features || "-"}
                </Typography>
              </Box>
            ) : (
              <TextField
                label="Job Content"
                value={formValue.features}
                onChange={(event) => handleChangeField("features", event.target.value)}
                disabled={submitting}
                fullWidth
                multiline
                minRows={3}
                required
              />
            )}

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              {isView ? (
                <Box sx={{ flex: 1 }}>
                  <Typography fontWeight={600}>Service Type: <span className="font-normal">{serviceTypeLabel}</span></Typography>
                </Box>
              ) : (
                <FormControl fullWidth>
                  <InputLabel id="service-type-label">Service Type</InputLabel>
                  <Select
                    labelId="service-type-label"
                    label="Service Type"
                    value={formValue.serviceType}
                    disabled={submitting}
                    onChange={(event) => {
                      const nextType = Number(event.target.value);
                      onFormChange((prev) => ({
                        ...prev,
                        serviceType: nextType,
                        ...(nextType === 1 ? { visitPerWeek: 1, durationDays: 1 } : {}),
                      }));
                    }}
                  >
                    {serviceTypeOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label} ({option.value})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {isView ? (
                <Box sx={{ flex: 1 }}>
                  <Typography fontWeight={600}>Visits Per Week: <span className="font-normal">{detail?.visitPerWeek ?? "-"}</span></Typography>
                  <Typography variant="body2"></Typography>
                </Box>
              ) : (
                <TextField
                  label="Visits Per Week"
                  type="number"
                  value={formValue.visitPerWeek ?? ""}
                  onChange={(event) => {
                    const raw = event.target.value;
                    if (raw === "") {
                      handleChangeField("visitPerWeek", null);
                      return;
                    }
                    const parsed = Number(raw);
                    if (!Number.isFinite(parsed)) {
                      return;
                    }
                    const clamped = Math.min(MAX_VISITS_PER_WEEK, Math.max(0, Math.trunc(parsed)));
                    handleChangeField("visitPerWeek", clamped);
                  }}
                  disabled={submitting || isServiceTypeFixed}
                  fullWidth
                  inputProps={{ min: 0, max: MAX_VISITS_PER_WEEK }}
                  helperText={`Maximum ${MAX_VISITS_PER_WEEK} visits per week`}
                />
              )}
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              {isView ? (
                <Box sx={{ flex: 1 }}>
                  <Typography fontWeight={600}>Duration (days): <span className="font-normal">{detail?.durationDays ?? "-"}</span></Typography>
                </Box>
              ) : (
                <TextField
                  label="Duration (days)"
                  type="number"
                  value={formValue.durationDays}
                  onChange={(event) => handleChangeField("durationDays", Number(event.target.value))}
                  disabled={submitting || isServiceTypeFixed}
                  fullWidth
                  inputProps={{ min: 1 }}
                />
              )}

              {isView ? (
                <Box sx={{ flex: 1 }}>
                  <Typography fontWeight={600}>Area Limit (m2): <span className="font-normal">{detail?.areaLimit ?? "-"}</span></Typography>
                  <Typography variant="body2"></Typography>
                </Box>
              ) : (
                <TextField
                  label="Area Limit (m2)"
                  type="number"
                  value={formValue.areaLimit}
                  onChange={(event) => handleChangeField("areaLimit", Number(event.target.value))}
                  disabled={submitting}
                  fullWidth
                  inputProps={{ min: 0 }}
                />
              )}

              {isView ? (
                <Box sx={{ flex: 1 }}>
                  <Typography fontWeight={600}>Unit Price: <span className="font-normal">{formatCurrency(detail?.unitPrice ?? 0, 'vi') ?? "-"}</span></Typography>
                </Box>
              ) : (
                <TextField
                  label="Unit Price"
                  type="text"
                  value={formatCurrencyInput(formValue.unitPrice, "vi")}
                  onChange={(event) => handleChangeField("unitPrice", parseCurrencyInput(event.target.value))}
                  disabled={submitting}
                  fullWidth
                />
              )}
            </Stack>

            {isView ? (
              <Box>
                <Typography fontWeight={600} sx={{ mb: 1 }}>
                  Suitability Rules
                </Typography>
                {readonlySuitabilityRules.length > 0 ? (
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    {readonlySuitabilityRules.map((rule) => {
                      const label =
                        rule.categoryId != null
                          ? `Category: ${rule.categoryName ?? rule.categoryId}`
                          : rule.careDifficultyLevel != null
                            ? `Care level: ${rule.careDifficultyLevelName ?? rule.careDifficultyLevel}`
                            : "Unknown";
                      return <Chip key={rule.id ?? `${label}`} label={label} size="small" />;
                    })}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    -
                  </Typography>
                )}
              </Box>
            ) : (
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <FormControl fullWidth>
                  <InputLabel id="suitability-category-label">Category</InputLabel>
                  <Select
                    labelId="suitability-category-label"
                    multiple
                    value={formValue.categoryIds}
                    label="Category"
                    disabled={submitting || isCategoryDisabled}
                    MenuProps={selectMenuProps}
                    onChange={(event) => {
                      const next = (event.target.value as number[]).map(Number);
                      onFormChange((prev) => ({
                        ...prev,
                        categoryIds: next,
                        ...(next.length > 0 ? { careDifficultyLevels: [] } : {}),
                      }));
                    }}
                    renderValue={(selected) =>
                      (selected as number[])
                        .map((id) => categoryOptions.find((item) => item.id === id)?.name ?? id)
                        .join(", ")
                    }
                  >
                    {categoryOptions.map((option) => (
                      <MenuItem key={option.id} value={option.id}>
                        <Checkbox checked={formValue.categoryIds.includes(option.id)} />
                        <ListItemText primary={option.name} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel id="suitability-carelevel-label">Care Difficulty Level</InputLabel>
                  <Select
                    labelId="suitability-carelevel-label"
                    multiple
                    value={formValue.careDifficultyLevels}
                    label="Care Difficulty Level"
                    disabled={submitting || isCareLevelDisabled}
                    MenuProps={selectMenuProps}
                    onChange={(event) => {
                      const next = (event.target.value as number[]).map(Number);
                      onFormChange((prev) => ({
                        ...prev,
                        careDifficultyLevels: next,
                        ...(next.length > 0 ? { categoryIds: [] } : {}),
                      }));
                    }}
                    renderValue={(selected) =>
                      (selected as number[])
                        .map((value) => careLevelOptions.find((item) => item.value === value)?.name ?? value)
                        .join(", ")
                    }
                  >
                    {careLevelOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        <Checkbox checked={formValue.careDifficultyLevels.includes(option.value)} />
                        <ListItemText primary={option.name} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            )}

            {canEditSpecializations ? (
              <FormControl fullWidth>
                <InputLabel id="specialization-label" className="font-semibold!">Specializations</InputLabel>
                <Select
                  labelId="specialization-label"
                  multiple
                  value={formValue.specializationIds}
                  label="Specializations"
                  disabled={submitting}
                  MenuProps={selectMenuProps}
                  onChange={(event) =>
                    handleChangeField("specializationIds", event.target.value as number[])
                  }
                  renderValue={(selected) =>
                    (selected as number[])
                      .map((id) => specializationOptions.find((item) => item.id === id)?.name ?? id)
                      .join(", ")
                  }
                >
                  {specializationOptions.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      <Checkbox checked={formValue.specializationIds.includes(option.id)} />
                      <ListItemText primary={option.name} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <Box>
                <Typography fontWeight={600} sx={{ mb: 1 }}>
                  Specializations
                </Typography>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  {readonlySpecializations.length > 0 ? (
                    readonlySpecializations.map((item) => (
                      <Chip key={item.id} label={item.name} size="small" />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No specialization data available
                    </Typography>
                  )}
                </Stack>
              </Box>
            )}

            {isView ? (
              <FormControlLabel
                sx={{ mt: 0.5, mx: 0 }}
                control={
                  <Switch
                    checked={Boolean(detail?.isActive)}
                    disabled
                    color="success"
                  />
                }
                label={
                  <Typography component="span" fontWeight={600}>
                    Active
                  </Typography>
                }
              />
            ) : (
              <FormControlLabel
                sx={{ mt: 0.5, mx: 0 }}
                control={
                  <Switch
                    checked={formValue.isActive}
                    onChange={(event) => handleChangeField("isActive", event.target.checked)}
                    disabled={submitting}
                    color="success"
                  />
                }
                label={
                  <Typography component="span" fontWeight={600}>
                    Active
                  </Typography>
                }
              />
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Close
        </Button>
        {isView && mode === "view" && onRequestEdit && (
          <Button onClick={onRequestEdit} variant="contained" disabled={submitting || detailLoading}>
            Update
          </Button>
        )}
        {!isView && (
          <Button onClick={() => void onSubmit()} variant="contained" disabled={submitting || detailLoading}>
            {submitting ? "Processing..." : isCreate ? "Create" : "Save Changes"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
