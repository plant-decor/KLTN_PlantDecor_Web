"use client";

import {
  Alert,
  Avatar,
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import type { StoreUserItem, StoreUserSpecializationOption } from "@/types/store-management.types";
import SpecializationAssignmentSection from "./SpecializationAssignmentSection";

interface StoreUserDetailDialogProps {
  open: boolean;
  loading: boolean;
  submitting: boolean;
  staff: StoreUserItem | null;
  specializations: StoreUserSpecializationOption[];
  selectedSpecializationIds: number[];
  error: string | null;
  onClose: () => void;
  onToggleSpecialization: (specializationId: number) => void;
  onSaveAll: () => void;
}

const getStatusLabel = (status: number) => {
  switch (status) {
    case 1:
      return "Hoạt động";
    case 2:
      return "Tạm khóa";
    default:
      return "Không xác định";
  }
};

const getStatusColor = (status: number): "success" | "warning" | "default" => {
  switch (status) {
    case 1:
      return "success";
    case 2:
      return "warning";
    default:
      return "default";
  }
};

export default function StoreUserDetailDialog({
  open,
  loading,
  submitting,
  staff,
  specializations,
  selectedSpecializationIds,
  error,
  onClose,
  onToggleSpecialization,
  onSaveAll,
}: StoreUserDetailDialogProps) {
  return (
    <Dialog open={open} onClose={submitting ? undefined : onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ pr: 6 }}>
        Chi tiết nhân viên
        <IconButton
          aria-label="close"
          onClick={onClose}
          disabled={submitting}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading && (
          <Box sx={{ py: 5, display: "flex", justifyContent: "center" }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && !staff && !error && (
          <Typography variant="body2" color="text.secondary">
            Không tìm thấy dữ liệu nhân viên.
          </Typography>
        )}

        {!loading && staff && (
          <Stack spacing={2.5}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ xs: "flex-start", sm: "center" }}>
              <Avatar src={staff.avatarUrl ?? undefined} sx={{ width: 64, height: 64 }}>
                {staff.username.charAt(0)}
              </Avatar>

              <Box>
                <Typography variant="h6" fontWeight={700}>
                  {staff.username}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {staff.email || "-"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {staff.phoneNumber || "-"}
                </Typography>
              </Box>

              <Chip
                label={getStatusLabel(staff.status)}
                color={getStatusColor(staff.status)}
                variant="outlined"
                sx={{ ml: { sm: "auto" } }}
              />
            </Stack>

            <SpecializationAssignmentSection
              options={specializations}
              selectedIds={selectedSpecializationIds}
              submitting={submitting}
              onToggleSpecialization={onToggleSpecialization}
              onSaveAll={onSaveAll}
            />
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}
