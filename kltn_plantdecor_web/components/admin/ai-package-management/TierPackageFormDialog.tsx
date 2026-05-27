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
import type { TierPackage, CreateTierPackageRequest, UpdateTierPackageRequest } from "@/types/tier-package.types";

interface FormValues {
  name: string;
  price: number;
  quotaRequests: number;
  durationMonths: string;
  description: string;
  isActive: boolean;
}

interface TierPackageFormDialogProps {
  open: boolean;
  saving: boolean;
  editTarget: TierPackage | null;
  onClose: () => void;
  onCreate: (data: CreateTierPackageRequest) => Promise<boolean>;
  onUpdate: (id: number, data: UpdateTierPackageRequest) => Promise<boolean>;
}

export default function TierPackageFormDialog({
  open,
  saving,
  editTarget,
  onClose,
  onCreate,
  onUpdate,
}: TierPackageFormDialogProps) {
  const isEdit = editTarget !== null;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: "",
      price: 0,
      quotaRequests: 0,
      durationMonths: "",
      description: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (open) {
      if (editTarget) {
        reset({
          name: editTarget.name,
          price: editTarget.price,
          quotaRequests: editTarget.quotaRequests,
          durationMonths: editTarget.durationMonths != null ? String(editTarget.durationMonths) : "",
          description: editTarget.description ?? "",
          isActive: editTarget.isActive,
        });
      } else {
        reset({ name: "", price: 0, quotaRequests: 0, durationMonths: "", description: "", isActive: true });
      }
    }
  }, [open, editTarget, reset]);

  const onSubmit = async (values: FormValues) => {
    const durationMonths = values.durationMonths.trim() !== "" ? Number(values.durationMonths) : undefined;

    if (isEdit && editTarget) {
      const payload: UpdateTierPackageRequest = {
        name: values.name,
        price: values.price,
        quotaRequests: values.quotaRequests,
        durationMonths,
        description: values.description || undefined,
        isActive: values.isActive,
      };
      const success = await onUpdate(editTarget.id, payload);
      if (success) onClose();
    } else {
      const payload: CreateTierPackageRequest = {
        name: values.name,
        price: values.price,
        quotaRequests: values.quotaRequests,
        durationMonths,
        description: values.description || undefined,
      };
      const success = await onCreate(payload);
      if (success) onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? "Edit AI Package" : "Add New AI Package"}</DialogTitle>
      <DialogContent>
        <Box component="form" noValidate sx={{ mt: 1 }}>
          <Stack spacing={2}>
            <Controller
              name="name"
              control={control}
              rules={{ required: "Package name is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Package Name"
                  required
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  size="small"
                  fullWidth
                />
              )}
            />
            <Controller
              name="price"
              control={control}
              rules={{
                required: "Price is required",
                min: { value: 0, message: "Price cannot be negative" },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Price (VND)"
                  required
                  type="number"
                  inputProps={{ min: 0 }}
                  error={!!errors.price}
                  helperText={errors.price?.message}
                  size="small"
                  fullWidth
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />
            <Controller
              name="quotaRequests"
              control={control}
              rules={{
                required: "Quota is required",
                min: { value: 1, message: "Quota must be greater than 0" },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Quota (AI requests)"
                  required
                  type="number"
                  inputProps={{ min: 1 }}
                  error={!!errors.quotaRequests}
                  helperText={errors.quotaRequests?.message}
                  size="small"
                  fullWidth
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />
            <Controller
              name="durationMonths"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Duration (months) — leave blank for lifetime"
                  type="number"
                  inputProps={{ min: 1 }}
                  size="small"
                  fullWidth
                />
              )}
            />
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Description"
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
