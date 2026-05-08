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
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import type {
  PolicyContent,
  PolicyContentUpsertRequest,
} from "@/lib/api/policyContentService";
import { POLICY_CATEGORIES } from "@/lib/constants/policyCategories";

interface PolicyContentModalProps {
  open: boolean;
  loading?: boolean;
  mode: "create" | "edit";
  policy?: PolicyContent;
  onClose: () => void;
  onSubmit: (payload: PolicyContentUpsertRequest) => Promise<boolean>;
}

interface FormState {
  title: string;
  category: number;
  summary: string;
  content: string;
  displayOrder: string;
  isActive: boolean;
}

const TITLE_MAX = 200;
const SUMMARY_MAX = 500;

const buildInitialForm = (policy?: PolicyContent): FormState => {
  if (policy) {
    return {
      title: policy.title ?? "",
      category: policy.category ?? POLICY_CATEGORIES[0].value,
      summary: policy.summary ?? "",
      content: policy.content ?? "",
      displayOrder: String(policy.displayOrder ?? 1),
      isActive: Boolean(policy.isActive),
    };
  }

  return {
    title: "",
    category: POLICY_CATEGORIES[0].value,
    summary: "",
    content: "",
    displayOrder: "1",
    isActive: true,
  };
};

const toIntOrNull = (value: string): number | null => {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const n = Number(trimmed);
  return Number.isFinite(n) && Number.isInteger(n) ? n : null;
};

export default function PolicyContentModal({
  open,
  loading = false,
  mode,
  policy,
  onClose,
  onSubmit,
}: PolicyContentModalProps) {
  const [form, setForm] = useState<FormState>(() => buildInitialForm(policy));
  const [formError, setFormError] = useState<string | null>(null);

  const title = mode === "create" ? "Add policy content" : "Edit policy content";

  const handleEntered = () => {
    setFormError(null);
    setForm(buildInitialForm(mode === "edit" ? policy : undefined));
  };

  const validate = useMemo(() => {
    if (!open) {
      return { ok: true, message: null as string | null };
    }

    const trimmedTitle = form.title.trim();
    const trimmedSummary = form.summary.trim();
    const trimmedContent = form.content.trim();
    const displayOrderNum = toIntOrNull(form.displayOrder);

    if (!trimmedTitle) {
      return { ok: false, message: "Title is required." };
    }
    if (trimmedTitle.length > TITLE_MAX) {
      return { ok: false, message: `Title must be at most ${TITLE_MAX} characters.` };
    }

    const isAllowedCategory = POLICY_CATEGORIES.some((c) => c.value === form.category);
    if (!isAllowedCategory) {
      return { ok: false, message: "Please select a valid category." };
    }

    if (!trimmedSummary) {
      return { ok: false, message: "Summary is required." };
    }
    if (trimmedSummary.length > SUMMARY_MAX) {
      return {
        ok: false,
        message: `Summary must be at most ${SUMMARY_MAX} characters.`,
      };
    }

    if (!trimmedContent) {
      return { ok: false, message: "Content is required." };
    }

    if (displayOrderNum == null) {
      return {
        ok: false,
        message: "Display order is required and must be an integer.",
      };
    }
    if (displayOrderNum < 1) {
      return { ok: false, message: "Display order must be greater than or equal to 1." };
    }

    return { ok: true, message: null };
  }, [open, form]);

  const handleSave = async () => {
    setFormError(null);

    if (!validate.ok) {
      setFormError(validate.message);
      return;
    }

    const displayOrderNum = toIntOrNull(form.displayOrder);
    if (displayOrderNum == null) {
      setFormError("Invalid display order.");
      return;
    }

    const payload: PolicyContentUpsertRequest = {
      title: form.title.trim(),
      category: form.category,
      summary: form.summary.trim(),
      content: form.content.trim(),
      displayOrder: displayOrderNum,
      isActive: form.isActive,
    };

    const ok = await onSubmit(payload);
    if (ok) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      TransitionProps={{ onEntered: handleEntered }}
    >
      <DialogTitle>
        <Typography fontWeight={700}>{title}</Typography>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          {formError && <Alert severity="error">{formError}</Alert>}

          <TextField
            label="Title"
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            disabled={loading}
            fullWidth
            inputProps={{ maxLength: TITLE_MAX }}
            helperText={`${form.title.length}/${TITLE_MAX}`}
          />

          <FormControl fullWidth disabled={loading}>
            <InputLabel id="policy-category-label">Category</InputLabel>
            <Select
              labelId="policy-category-label"
              label="Category"
              value={form.category}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, category: Number(e.target.value) }))
              }
            >
              {POLICY_CATEGORIES.map((c) => (
                <MenuItem key={c.value} value={c.value}>
                  {c.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Summary"
            value={form.summary}
            onChange={(e) => setForm((prev) => ({ ...prev, summary: e.target.value }))}
            disabled={loading}
            fullWidth
            multiline
            minRows={2}
            maxRows={4}
            inputProps={{ maxLength: SUMMARY_MAX }}
            helperText={`${form.summary.length}/${SUMMARY_MAX}`}
          />

          <TextField
            label="Content"
            value={form.content}
            onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
            disabled={loading}
            fullWidth
            multiline
            minRows={8}
            maxRows={16}
          />

          <TextField
            label="Display order"
            value={form.displayOrder}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, displayOrder: e.target.value }))
            }
            type="number"
            inputProps={{ min: 1, step: 1 }}
            disabled={loading}
            fullWidth
            helperText="Smaller numbers appear first within the category."
          />

          <FormControlLabel
            control={
              <Switch
                checked={form.isActive}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, isActive: e.target.checked }))
                }
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
