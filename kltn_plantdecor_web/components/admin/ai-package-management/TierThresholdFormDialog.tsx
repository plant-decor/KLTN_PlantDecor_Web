"use client";

import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
} from "@mui/material";
import type {
  TierThreshold,
  CreateTierThresholdRequest,
  UpdateTierThresholdRequest,
} from "@/types/tier-package.types";

interface FormValues {
  name: string;
  tierLevel: number;
  minTotalSpent: number;
  monthlyFreeQuota: number;
  benefitDescription: string;
  isActive: boolean;
}

interface TierThresholdFormDialogProps {
  open: boolean;
  saving: boolean;
  editTarget: TierThreshold | null;
  onClose: () => void;
  onCreate: (data: CreateTierThresholdRequest) => Promise<boolean>;
  onUpdate: (id: number, data: UpdateTierThresholdRequest) => Promise<boolean>;
}

export default function TierThresholdFormDialog({
  open,
  saving,
  editTarget,
  onClose,
  onCreate,
  onUpdate,
}: TierThresholdFormDialogProps) {
  const isEdit = editTarget !== null;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: "",
      tierLevel: 1,
      minTotalSpent: 0,
      monthlyFreeQuota: 0,
      benefitDescription: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (open) {
      if (editTarget) {
        reset({
          name: editTarget.name,
          tierLevel: editTarget.tierLevel,
          minTotalSpent: editTarget.minTotalSpent,
          monthlyFreeQuota: editTarget.monthlyFreeQuota,
          benefitDescription: editTarget.benefitDescription ?? "",
          isActive: editTarget.isActive,
        });
      } else {
        reset({ name: "", tierLevel: 1, minTotalSpent: 0, monthlyFreeQuota: 0, benefitDescription: "", isActive: true });
      }
    }
  }, [open, editTarget, reset]);

  const onSubmit = async (values: FormValues) => {
    if (isEdit && editTarget) {
      const payload: UpdateTierThresholdRequest = {
        name: values.name,
        tierLevel: values.tierLevel,
        minTotalSpent: values.minTotalSpent,
        monthlyFreeQuota: values.monthlyFreeQuota,
        benefitDescription: values.benefitDescription || undefined,
        isActive: values.isActive,
      };
      const success = await onUpdate(editTarget.id, payload);
      if (success) onClose();
    } else {
      const payload: CreateTierThresholdRequest = {
        name: values.name,
        tierLevel: values.tierLevel,
        minTotalSpent: values.minTotalSpent,
        monthlyFreeQuota: values.monthlyFreeQuota,
        benefitDescription: values.benefitDescription || undefined,
      };
      const success = await onCreate(payload);
      if (success) onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? "Edit Tier Threshold" : "Add New Tier Threshold"}</DialogTitle>
      <DialogContent>
        <Box component="form" noValidate sx={{ mt: 1 }}>
          <Stack spacing={2}>
            <Controller
              name="name"
              control={control}
              rules={{ required: "Tier name is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Tier Name (e.g. Bronze, Silver, Gold)"
                  required
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  size="small"
                  fullWidth
                />
              )}
            />
            <Controller
              name="tierLevel"
              control={control}
              rules={{
                required: "Tier level is required",
                min: { value: 1, message: "Level must be greater than 0" },
                max: { value: 99, message: "Level cannot exceed 99" },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Tier Level"
                  required
                  type="number"
                  inputProps={{ min: 1, max: 99 }}
                  error={!!errors.tierLevel}
                  helperText={errors.tierLevel?.message}
                  size="small"
                  fullWidth
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />
            <Controller
              name="minTotalSpent"
              control={control}
              rules={{
                required: "Minimum spend is required",
                min: { value: 0, message: "Cannot be negative" },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Minimum Total Spend (VND)"
                  required
                  type="number"
                  inputProps={{ min: 0 }}
                  error={!!errors.minTotalSpent}
                  helperText={errors.minTotalSpent?.message}
                  size="small"
                  fullWidth
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />
            <Controller
              name="monthlyFreeQuota"
              control={control}
              rules={{
                required: "Monthly free quota is required",
                min: { value: 0, message: "Cannot be negative" },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Monthly Free Quota (AI requests)"
                  required
                  type="number"
                  inputProps={{ min: 0 }}
                  error={!!errors.monthlyFreeQuota}
                  helperText={errors.monthlyFreeQuota?.message}
                  size="small"
                  fullWidth
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />
            <Controller
              name="benefitDescription"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Benefit Description"
                  multiline
                  rows={3}
                  size="small"
                  fullWidth
                />
              )}
            />
            {isEdit && (
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                    label="Active"
                  />
                )}
              />
            )}
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          variant="contained"
          className="bg-primary!"
          onClick={handleSubmit(onSubmit)}
          disabled={saving}
        >
          {saving ? "Saving..." : isEdit ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
