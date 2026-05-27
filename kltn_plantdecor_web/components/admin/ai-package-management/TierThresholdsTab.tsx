"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { Add, Edit, ToggleOff } from "@mui/icons-material";
import { hoverLiftStyle } from "@/lib/styles/buttonStyles";
import useAdminTierThresholds from "@/lib/api/admin/useAdminTierThresholds";
import TierThresholdFormDialog from "./TierThresholdFormDialog";
import type { TierThreshold } from "@/types/tier-package.types";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

export default function TierThresholdsTab() {
  const { thresholds, loading, saving, fetchThresholds, addThreshold, editThreshold, removeThreshold } =
    useAdminTierThresholds();

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<TierThreshold | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<TierThreshold | null>(null);

  useEffect(() => {
    fetchThresholds();
  }, [fetchThresholds]);

  const handleOpenCreate = useCallback(() => {
    setEditTarget(null);
    setFormOpen(true);
  }, []);

  const handleOpenEdit = useCallback((threshold: TierThreshold) => {
    setEditTarget(threshold);
    setFormOpen(true);
  }, []);

  const handleConfirmDeactivate = useCallback(async () => {
    if (!deactivateTarget) return;
    await removeThreshold(deactivateTarget.id);
    setDeactivateTarget(null);
  }, [deactivateTarget, removeThreshold]);

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenCreate}
          sx={{ ...hoverLiftStyle }}
          className="bg-primary!"
        >
          Add Threshold
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table size="small">
          <TableHead sx={{ backgroundColor: "var(--primary)" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Tier Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Level</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Min Spend</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Free Quota/Month</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Benefits</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">Loading...</Typography>
                </TableCell>
              </TableRow>
            ) : thresholds.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">No tier thresholds found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              thresholds.map((threshold) => (
                <TableRow key={threshold.id} hover>
                  <TableCell>{threshold.id}</TableCell>
                  <TableCell>
                    <Typography fontWeight={600}>{threshold.name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={`Cấp ${threshold.tierLevel}`} size="small" variant="outlined" color="primary" />
                  </TableCell>
                  <TableCell>{formatCurrency(threshold.minTotalSpent)}</TableCell>
                  <TableCell>{threshold.monthlyFreeQuota.toLocaleString()} requests</TableCell>
                  <TableCell sx={{ maxWidth: 200 }}>
                    <Typography variant="body2" color="text.secondary">
                      {threshold.benefitDescription
                        ? threshold.benefitDescription.length > 60
                          ? `${threshold.benefitDescription.slice(0, 60)}...`
                          : threshold.benefitDescription
                        : "—"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={threshold.isActive ? "Active" : "Inactive"}
                      color={threshold.isActive ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={0.5} justifyContent="center">
                      <Tooltip title="Edit">
                        <IconButton size="small" color="primary" onClick={() => handleOpenEdit(threshold)}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {threshold.isActive && (
                        <Tooltip title="Deactivate threshold">
                          <IconButton
                            size="small"
                            color="warning"
                            onClick={() => setDeactivateTarget(threshold)}
                          >
                            <ToggleOff fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TierThresholdFormDialog
        open={formOpen}
        saving={saving}
        editTarget={editTarget}
        onClose={() => setFormOpen(false)}
        onCreate={addThreshold}
        onUpdate={editThreshold}
      />

      <Dialog open={deactivateTarget !== null} onClose={() => setDeactivateTarget(null)} maxWidth="xs">
        <DialogTitle>Confirm Deactivation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to deactivate the tier threshold <strong>{deactivateTarget?.name}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeactivateTarget(null)} disabled={saving}>
            Cancel
          </Button>
          <Button variant="contained" color="warning" onClick={handleConfirmDeactivate} disabled={saving}>
            {saving ? "Processing..." : "Deactivate"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
