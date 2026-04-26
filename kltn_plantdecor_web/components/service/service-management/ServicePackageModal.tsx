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
import { formatCurrency } from "@/lib/utils/formatUtil";

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
                    onChange={(event) => handleChangeField("serviceType", Number(event.target.value))}
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
                    handleChangeField("visitPerWeek", raw === "" ? null : Number(raw));
                  }}
                  disabled={submitting}
                  fullWidth
                  inputProps={{ min: 0 }}
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
                  disabled={submitting}
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
                  type="number"
                  value={formValue.unitPrice}
                  onChange={(event) => handleChangeField("unitPrice", Number(event.target.value))}
                  disabled={submitting}
                  fullWidth
                  inputProps={{ min: 0 }}
                />
              )}
            </Stack>

            {isView ? (
              <Box className="flex items-center gap-2">
                <Typography fontWeight={600} sx={{ mb: 1 }}>
                  Status
                </Typography>
                <Chip size="small" color={detail?.isActive ? "success" : "default"} label={detail?.isActive ? "Active" : "Inactive"} />
              </Box>
            ) : (
              <FormControl fullWidth>
                <InputLabel id="active-label">Status</InputLabel>
                <Select
                  labelId="active-label"
                  label="Status"
                  value={formValue.isActive ? 1 : 0}
                  disabled={submitting}
                  onChange={(event) => handleChangeField("isActive", Number(event.target.value) === 1)}
                >
                  <MenuItem value={1}>Active</MenuItem>
                  <MenuItem value={0}>Inactive</MenuItem>
                </Select>
              </FormControl>
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
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Đóng
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
