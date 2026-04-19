"use client";

import SaveIcon from "@mui/icons-material/Save";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  Stack,
  Typography,
} from "@mui/material";
import type { StoreUserSpecializationOption } from "@/types/store-management.types";
import { hoverLiftStyle } from "@/lib/styles/buttonStyles";

interface SpecializationAssignmentSectionProps {
  options: StoreUserSpecializationOption[];
  selectedIds: number[];
  submitting: boolean;
  onToggleSpecialization: (specializationId: number) => void;
  onSaveAll: () => void;
  readOnly?: boolean;
}

export default function SpecializationAssignmentSection({
  options,
  selectedIds,
  submitting,
  onToggleSpecialization,
  onSaveAll,
  readOnly = false,
}: SpecializationAssignmentSectionProps) {
  // If read-only and no specializations, don't render the section
  if (readOnly && selectedIds.length === 0) {
    return null;
  }

  const selectedSpecializations = options.filter((spec) => selectedIds.includes(spec.id));

  return (
    <Stack spacing={2}>
      <Typography variant="subtitle1" fontWeight={700}>
        Quản lý chuyên môn
      </Typography>

      {!readOnly && (
        <Stack direction="row" justifyContent="flex-end">
          <Button variant="contained" startIcon={<SaveIcon />} onClick={onSaveAll} disabled={submitting} sx={{backgroundColor: 'var(--primary)', ...hoverLiftStyle}}>
            Lưu toàn bộ
          </Button>
        </Stack>
      )}

      <Divider />

      {readOnly ? (
        // Read-only mode: display as chips
        <Stack spacing={1.5}>
          {selectedSpecializations.length > 0 ? (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {selectedSpecializations.map((specialization) => (
                <Chip
                  key={specialization.id}
                  label={specialization.name}
                  variant="outlined"
                  title={specialization.description}
                />
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Không có chuyên môn được gán.
            </Typography>
          )}
        </Stack>
      ) : (
        // Edit mode: display as checkboxes
        <Box
          sx={{
            maxHeight: 280,
            overflowY: "auto",
            border: "1px solid var(--card-border)",
            borderRadius: 1.5,
            p: 1.5,
          }}
        >
          <Stack spacing={1}>
            {options.map((specialization) => (
              <FormControlLabel
                key={specialization.id}
                control={
                  <Checkbox
                    checked={selectedIds.includes(specialization.id)}
                    onChange={() => onToggleSpecialization(specialization.id)}
                    disabled={submitting}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {specialization.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {specialization.description || "Không có mô tả"}
                    </Typography>
                  </Box>
                }
              />
            ))}

            {options.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                Không có chuyên môn khả dụng.
              </Typography>
            )}
          </Stack>
        </Box>
      )}
    </Stack>
  );
}
