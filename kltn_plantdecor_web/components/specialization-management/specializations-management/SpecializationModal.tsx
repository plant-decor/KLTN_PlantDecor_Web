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
    ? "Create New Specialization"
    : mode === "edit"
      ? `Edit Specialization #${specializationId ?? ""}`
      : `View Specialization #${specializationId ?? ""}`;

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
              label="Specialization Name"
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
              minRows={4}
              required
            />

            <Box className="flex items-center justify-between rounded-xl border border-(--card-border) px-4 py-3">
              <Box>
                <Typography variant="subtitle2" fontWeight={700}>
                  Active Status
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Turn on to display the specialization in the system.
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
                  Saved Information
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {detail.isActive ? "Active" : "Inactive"}
                </Typography>
              </Box>
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Close
        </Button>
        {!isView && (
          <Button onClick={() => void onSubmit()} variant="contained" disabled={submitting || detailLoading}>
            {submitting ? "Processing..." : isCreate ? "Create New" : "Save Changes"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
