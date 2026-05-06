"use client";

import CloseIcon from "@mui/icons-material/Close";
import {
  Alert,
  Box,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import type { ReactNode } from "react";
import type { CareServicePackage } from "@/types/care-service.types";
import { formatCurrency } from "@/lib/utils/formatUtil";
import { formatDateTime } from "@/lib/utils/dateUtils";

type Props = {
  open: boolean;
  loading: boolean;
  error: string | null;
  detail: CareServicePackage | null;
  onClose: () => void;
};


function FieldRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ minWidth: 180 }}
      >
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={500} sx={{ wordBreak: "break-word" }}>
        {value ?? "-"}
      </Typography>
    </Stack>
  );
}

export function CareServicePackageDetailDialog({
  open,
  loading,
  error,
  detail,
  onClose,
}: Props) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pr: 6 }}>
        Package details #{detail?.id ?? "-"}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: "absolute", right: 12, top: 12 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <Typography>Loading details...</Typography>
          </Box>
        )}

        {!loading && error && <Alert severity="error">{error}</Alert>}

        {!loading && !error && detail && (
          <Stack spacing={2}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ sm: "center" }}>
              <Typography variant="h6" fontWeight={800} sx={{ flex: 1 }}>
                {detail.name}
              </Typography>
              <Typography variant="subtitle1" fontWeight={800} color="#15803d">
                {formatCurrency(detail.unitPrice, "vi-VN")}
              </Typography>
            </Stack>

            <Divider />

            <Typography variant="subtitle1" fontWeight={800}>
              Basic information
            </Typography>
            <FieldRow label="Service type" value={detail.serviceType} />
            <FieldRow label="Visits per week" value={detail.visitPerWeek} />
            <FieldRow label="Duration (days)" value={detail.durationDays} />
            <FieldRow label="Total sessions" value={detail.totalSessions ?? "-"} />
            <FieldRow label="Area limit (m2)" value={detail.areaLimit} />
            <FieldRow label="Active" value={detail.isActive ? "Yes" : "No"} />
            <FieldRow label="Created at" value={formatDateTime(detail.createdAt ?? "")} />

            <Divider />

            <Typography variant="subtitle1" fontWeight={800}>
              Description
            </Typography>
            <Typography variant="body2" whiteSpace="pre-line">
              {detail.description || "-"}
            </Typography>

            <Typography variant="subtitle1" fontWeight={800}>
              Features
            </Typography>
            <Typography variant="body2" whiteSpace="pre-line">
              {detail.features || "-"}
            </Typography>

            <Divider />

            <Typography variant="subtitle1" fontWeight={800}>
              Specializations
            </Typography>
            {detail.specializations?.length ? (
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                {detail.specializations.map((s) => (
                  <Chip key={s.id} label={s.name} size="small" />
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                -
              </Typography>
            )}

            <Typography variant="subtitle1" fontWeight={800}>
              Suitability rules
            </Typography>
            {detail.suitabilityRules?.length ? (
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                {detail.suitabilityRules.map((rule, idx) => {
                  const label =
                    rule.categoryId != null
                      ? `Category: ${rule.categoryName ?? rule.categoryId}`
                      : rule.careDifficultyLevel != null
                        ? `Care level: ${rule.careDifficultyLevelName ?? rule.careDifficultyLevel}`
                        : "Unknown";
                  return (
                    <Chip
                      key={rule.id ?? `${label}-${idx}`}
                      label={label}
                      size="small"
                    />
                  );
                })}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                -
              </Typography>
            )}
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}

