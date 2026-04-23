"use client";

import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  InputAdornment,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import type { DepositPolicy, DepositPolicyUpsertRequest } from "@/lib/api/depositPolicyService";
import { formatCurrencyInput, parseCurrencyInput } from "@/lib/utils/formatUtil";

interface DepositPolicyModalProps {
  open: boolean;
  loading?: boolean;
  mode: "create" | "edit";
  policy?: DepositPolicy;
  existingPolicies: DepositPolicy[];
  onClose: () => void;
  onSubmit: (payload: DepositPolicyUpsertRequest) => Promise<boolean>;
}

type FormState = {
  minPrice: string;
  maxPrice: string;
  depositPercentage: string;
  isActive: boolean;
};

const toCurrencyNumberOrNull = (value: string): number | null => {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  return parseCurrencyInput(trimmed);
};

const toCurrencyNumber = (value: string): number | null => {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  return parseCurrencyInput(trimmed);
};

const toPercentNumber = (value: string): number | null => {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
};

const maxToInfinity = (maxPrice: number | null): number => {
  return maxPrice == null ? Number.POSITIVE_INFINITY : maxPrice;
};

const rangesOverlapHalfOpen = (aMin: number, aMax: number | null, bMin: number, bMax: number | null): boolean => {
  const aMaxInf = maxToInfinity(aMax);
  const bMaxInf = maxToInfinity(bMax);
  // Half-open intervals [min, max) so touching boundaries won't overlap.
  return aMin < bMaxInf && bMin < aMaxInf;
};

export default function DepositPolicyModal({
  open,
  loading = false,
  mode,
  policy,
  existingPolicies,
  onClose,
  onSubmit,
}: DepositPolicyModalProps) {
  const [form, setForm] = useState<FormState>({
    minPrice: "",
    maxPrice: "",
    depositPercentage: "",
    isActive: true,
  });
  const [formError, setFormError] = useState<string | null>(null);

  const title = mode === "create" ? "Add deposit policy" : "Edit deposit policy";
  const handleEntered = () => {
    setFormError(null);

    if (mode === "edit" && policy) {
      setForm({
        minPrice: formatCurrencyInput(policy.minPrice ?? 0, "vi-VN"),
        maxPrice: policy.maxPrice == null ? "" : formatCurrencyInput(policy.maxPrice, "vi-VN"),
        depositPercentage: String(policy.depositPercentage ?? 0),
        isActive: Boolean(policy.isActive),
      });
      return;
    }

    setForm({
      minPrice: "",
      maxPrice: "",
      depositPercentage: "",
      isActive: true,
    });
  };

  const normalizedPayload = useMemo(() => {
    const minPrice = toCurrencyNumber(form.minPrice);
    const maxPrice = toCurrencyNumberOrNull(form.maxPrice);
    const depositPercentage = toPercentNumber(form.depositPercentage);

    if (minPrice == null || depositPercentage == null) {
      return null;
    }

    return {
      minPrice,
      maxPrice,
      depositPercentage,
      isActive: form.isActive,
    } satisfies DepositPolicyUpsertRequest;
  }, [form]);

  const validate = useMemo(() => {
    if (!open) {
      return { ok: true, message: null as string | null };
    }

    const minPrice = toCurrencyNumber(form.minPrice);
    const maxPrice = toCurrencyNumberOrNull(form.maxPrice);
    const depositPercentage = toPercentNumber(form.depositPercentage);

    if (minPrice == null) {
      return { ok: false, message: "Min price is required and must be a number." };
    }
    if (minPrice < 0) {
      return { ok: false, message: "Min price must be greater than or equal to 0." };
    }

    if (maxPrice != null) {
      if (maxPrice <= minPrice) {
        return { ok: false, message: "Max price must be greater than min price (or leave empty for no limit)." };
      }
      if (maxPrice < 0) {
        return { ok: false, message: "Max price must be greater than or equal to 0." };
      }
    }

    if (depositPercentage == null) {
      return { ok: false, message: "Deposit percentage is required and must be a number." };
    }
    if (depositPercentage <= 0 || depositPercentage > 100) {
      return { ok: false, message: "Deposit percentage must be between 1 and 100." };
    }

    const editingId = mode === "edit" ? policy?.id : undefined;
    const overlaps = existingPolicies.some((item) => {
      if (editingId && item.id === editingId) {
        return false;
      }
      return rangesOverlapHalfOpen(minPrice, maxPrice, item.minPrice, item.maxPrice);
    });

    if (overlaps) {
      return { ok: false, message: "Price range overlaps with an existing deposit policy." };
    }

    return { ok: true, message: null };
  }, [existingPolicies, form.depositPercentage, form.maxPrice, form.minPrice, mode, open, policy?.id]);

  const handleSave = async () => {
    setFormError(null);

    if (!validate.ok) {
      setFormError(validate.message);
      return;
    }

    if (!normalizedPayload) {
      setFormError("Invalid form values.");
      return;
    }

    const ok = await onSubmit(normalizedPayload);
    if (ok) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" TransitionProps={{ onEntered: handleEntered }}>
      <DialogTitle>
        <Typography fontWeight={700}>{title}</Typography>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          {formError && <Alert severity="error">{formError}</Alert>}

          <TextField
            label="Min price"
            value={form.minPrice}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                minPrice: formatCurrencyInput(e.target.value, "vi-VN"),
              }))
            }
            inputProps={{ inputMode: "numeric" }}
            disabled={loading}
            fullWidth
          />

          <TextField
            label="Max price (optional)"
            value={form.maxPrice}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                maxPrice: formatCurrencyInput(e.target.value, "vi-VN"),
              }))
            }
            inputProps={{ inputMode: "numeric" }}
            disabled={loading}
            fullWidth
            helperText="Leave empty for no limit."
          />

          <TextField
            label="Deposit percentage"
            value={form.depositPercentage}
            onChange={(e) => setForm((prev) => ({ ...prev, depositPercentage: e.target.value }))}
            type="number"
            inputProps={{ min: 1, max: 100 }}
            disabled={loading}
            fullWidth
            slotProps={{
              input: {
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              },
            }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={form.isActive}
                onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                disabled={loading}
              />
            }
            label="Active"
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit" disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          className="bg-primary!"
          disabled={loading || !validate.ok}
        >
          {mode === "create" ? "Create" : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

