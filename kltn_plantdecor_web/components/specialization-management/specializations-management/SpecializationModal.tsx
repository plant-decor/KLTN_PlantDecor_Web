import React from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import type { AdminSpecializationDetail } from "@/types/admin-specialization.types";
import type { SpecializationFormValue, SpecializationModalMode } from "./types";

interface SpecializationModalProps {
  open: boolean;
  mode: SpecializationModalMode;
  specializationId: number | null;
  detail: AdminSpecializationDetail | null;
  detailLoading: boolean;
  detailError: string | null;
  formValue: SpecializationFormValue;
  submitting: boolean;
  onClose: () => void;
  onFormChange: (updater: (prev: SpecializationFormValue) => SpecializationFormValue) => void;
  onSubmit: () => Promise<void>;
}

export default function SpecializationModal({
  open,
  mode,
  specializationId,
  detail,
  detailLoading,
  detailError,
  formValue,
  submitting,
  onClose,
  onFormChange,
  onSubmit,
}: SpecializationModalProps) {
  const isView = mode === "view";
  const isCreate = mode === "create";

  const title = isCreate
    ? "Tạo chuyên môn mới"
    : mode === "edit"
      ? `Cập nhật chuyên môn #${specializationId ?? ""}`
      : `Chi tiết chuyên môn #${specializationId ?? ""}`;

  const handleChangeField = <K extends keyof SpecializationFormValue>(
    field: K,
    value: SpecializationFormValue[K]
  ) => {
    onFormChange((prev) => ({ ...prev, [field]: value }));
  };

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
              label="Tên chuyên môn"
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
              minRows={4}
              required
            />

            <Box className="flex items-center justify-between rounded-xl border border-(--card-border) px-4 py-3">
              <Box>
                <Typography variant="subtitle2" fontWeight={700}>
                  Trạng thái hoạt động
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Bật để hiển thị chuyên môn trong hệ thống.
                </Typography>
              </Box>
              <Switch
                checked={formValue.isActive}
                disabled={isView || submitting}
                onChange={(event) => handleChangeField("isActive", event.target.checked)}
              />
            </Box>

            {isView && detail && (
              <Box className="rounded-xl border border-(--card-border) bg-(--surface) px-4 py-3">
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                  Thông tin đã lưu
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {detail.isActive ? "Đang hoạt động" : "Đã vô hiệu hóa"}
                </Typography>
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
