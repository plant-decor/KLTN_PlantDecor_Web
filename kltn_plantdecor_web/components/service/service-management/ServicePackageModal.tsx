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
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  Chip,
} from "@mui/material";
import type {
  AdminCareServicePackageDetail,
  AdminSpecializationOption,
  CareServiceTypeOption,
} from "@/types/admin-service-package.types";
import type { ModalMode, ServicePackageFormValue } from "./types";
import { CustomLoading } from "@/components/CustomLoading";

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
  submitting: boolean;
  onClose: () => void;
  onFormChange: (updater: (prev: ServicePackageFormValue) => ServicePackageFormValue) => void;
  onSubmit: () => Promise<void>;
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
  submitting,
  onClose,
  onFormChange,
  onSubmit,
}: ServicePackageModalProps) {
  const isView = mode === "view";
  const isCreate = mode === "create";

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
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Package Name"
              value={formValue.name}
              onChange={(event) => handleChangeField("name", event.target.value)}
              disabled={isView || submitting}
              fullWidth
              required
            />

            <TextField
              label="Description"
              value={formValue.description}
              onChange={(event) => handleChangeField("description", event.target.value)}
              disabled={isView || submitting}
              fullWidth
              multiline
              minRows={2}
              required
            />

            <TextField
              label="Job Content"
              value={formValue.features}
              onChange={(event) => handleChangeField("features", event.target.value)}
              disabled={isView || submitting}
              fullWidth
              multiline
              minRows={3}
              required
            />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <FormControl fullWidth>
                <InputLabel id="service-type-label">Service Type</InputLabel>
                <Select
                  labelId="service-type-label"
                  label="Service Type"
                  value={formValue.serviceType}
                  disabled={isView || submitting}
                  onChange={(event) => handleChangeField("serviceType", Number(event.target.value))}
                >
                  {serviceTypeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label} ({option.value})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Visits Per Week"
                type="number"
                value={formValue.visitPerWeek ?? ""}
                onChange={(event) => {
                  const raw = event.target.value;
                  handleChangeField("visitPerWeek", raw === "" ? null : Number(raw));
                }}
                disabled={isView || submitting}
                fullWidth
                inputProps={{ min: 0 }}
              />
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Duration (days)"
                type="number"
                value={formValue.durationDays}
                onChange={(event) => handleChangeField("durationDays", Number(event.target.value))}
                disabled={isView || submitting}
                fullWidth
                inputProps={{ min: 1 }}
              />

              <TextField
                label="Area Limit (m2)"
                type="number"
                value={formValue.areaLimit}
                onChange={(event) => handleChangeField("areaLimit", Number(event.target.value))}
                disabled={isView || submitting}
                fullWidth
                inputProps={{ min: 0 }}
              />

              <TextField
                label="Unit Price"
                type="number"
                value={formValue.unitPrice}
                onChange={(event) => handleChangeField("unitPrice", Number(event.target.value))}
                disabled={isView || submitting}
                fullWidth
                inputProps={{ min: 0 }}
              />
            </Stack>

            <FormControl fullWidth>
              <InputLabel id="active-label">Status</InputLabel>
              <Select
                labelId="active-label"
                label="Status"
                value={formValue.isActive ? 1 : 0}
                disabled={isView || submitting}
                onChange={(event) => handleChangeField("isActive", Number(event.target.value) === 1)}
              >
                <MenuItem value={1}>Active</MenuItem>
                <MenuItem value={0}>Inactive</MenuItem>
              </Select>
            </FormControl>

            {isCreate ? (
              <FormControl fullWidth>
                <InputLabel id="specialization-label">Specializations</InputLabel>
                <Select
                  labelId="specialization-label"
                  multiple
                  value={formValue.specializationIds}
                  label="Specializations"
                  disabled={isView || submitting}
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
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
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
                {mode === "edit" && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                    Specializations are read-only in update mode.
                  </Typography>
                )}
              </Box>
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Đóng
        </Button>
        {!isView && (
          <Button onClick={() => void onSubmit()} variant="contained" disabled={submitting || detailLoading}>
            {submitting ? "Processing..." : isCreate ? "Create" : "Save Changes"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
