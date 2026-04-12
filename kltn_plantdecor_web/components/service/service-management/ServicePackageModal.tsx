import React from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
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
    ? "Tạo gói dịch vụ mới"
    : mode === "edit"
      ? `Cập nhật gói #${packageId ?? ""}`
      : `Chi tiết gói #${packageId ?? ""}`;

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
            <CircularProgress />
          </Box>
        ) : detailError ? (
          <Alert severity="error">{detailError}</Alert>
        ) : (
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Tên gói"
              value={formValue.name}
              onChange={(event) => handleChangeField("name", event.target.value)}
              disabled={isView || submitting}
              fullWidth
              required
            />

            <TextField
              label="Mô tả"
              value={formValue.description}
              onChange={(event) => handleChangeField("description", event.target.value)}
              disabled={isView || submitting}
              fullWidth
              multiline
              minRows={2}
              required
            />

            <TextField
              label="Nội dung công việc"
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
                <InputLabel id="service-type-label">Loại dịch vụ</InputLabel>
                <Select
                  labelId="service-type-label"
                  label="Loại dịch vụ"
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
                label="Số lần/tuần"
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
                label="Thời lượng (ngày)"
                type="number"
                value={formValue.durationDays}
                onChange={(event) => handleChangeField("durationDays", Number(event.target.value))}
                disabled={isView || submitting}
                fullWidth
                inputProps={{ min: 1 }}
              />

              <TextField
                label="Giới hạn diện tích (m2)"
                type="number"
                value={formValue.areaLimit}
                onChange={(event) => handleChangeField("areaLimit", Number(event.target.value))}
                disabled={isView || submitting}
                fullWidth
                inputProps={{ min: 0 }}
              />

              <TextField
                label="Đơn giá"
                type="number"
                value={formValue.unitPrice}
                onChange={(event) => handleChangeField("unitPrice", Number(event.target.value))}
                disabled={isView || submitting}
                fullWidth
                inputProps={{ min: 0 }}
              />
            </Stack>

            <FormControl fullWidth>
              <InputLabel id="active-label">Trạng thái</InputLabel>
              <Select
                labelId="active-label"
                label="Trạng thái"
                value={formValue.isActive ? 1 : 0}
                disabled={isView || submitting}
                onChange={(event) => handleChangeField("isActive", Number(event.target.value) === 1)}
              >
                <MenuItem value={1}>Đang hoạt động</MenuItem>
                <MenuItem value={0}>Đã vô hiệu hóa</MenuItem>
              </Select>
            </FormControl>

            {isCreate ? (
              <FormControl fullWidth>
                <InputLabel id="specialization-label">Chuyên môn áp dụng</InputLabel>
                <Select
                  labelId="specialization-label"
                  multiple
                  value={formValue.specializationIds}
                  label="Chuyên môn áp dụng"
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
                  Chuyên môn
                </Typography>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  {readonlySpecializations.length > 0 ? (
                    readonlySpecializations.map((item) => (
                      <Chip key={item.id} label={item.name} size="small" />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Không có dữ liệu chuyên môn
                    </Typography>
                  )}
                </Stack>
                {mode === "edit" && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                    Chuyên môn chỉ đọc ở chế độ cập nhật.
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
            {submitting ? "Đang xử lý..." : isCreate ? "Tạo mới" : "Lưu thay đổi"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
