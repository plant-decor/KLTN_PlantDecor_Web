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
import useAdminTierPackages from "@/lib/api/admin/useAdminTierPackages";
import TierPackageFormDialog from "./TierPackageFormDialog";
import type { TierPackage } from "@/types/tier-package.types";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

export default function TierPackagesTab() {
  const { packages, loading, saving, fetchPackages, addPackage, editPackage, removePackage } =
    useAdminTierPackages();

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<TierPackage | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<TierPackage | null>(null);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  const handleOpenCreate = useCallback(() => {
    setEditTarget(null);
    setFormOpen(true);
  }, []);

  const handleOpenEdit = useCallback((pkg: TierPackage) => {
    setEditTarget(pkg);
    setFormOpen(true);
  }, []);

  const handleConfirmDeactivate = useCallback(async () => {
    if (!deactivateTarget) return;
    await removePackage(deactivateTarget.id);
    setDeactivateTarget(null);
  }, [deactivateTarget, removePackage]);

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
          Add Package
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table size="small">
          <TableHead sx={{ backgroundColor: "var(--primary)" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Package Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Price</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Quota</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Duration</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">Loading...</Typography>
                </TableCell>
              </TableRow>
            ) : packages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">No AI packages found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              packages.map((pkg) => (
                <TableRow key={pkg.id} hover>
                  <TableCell>{pkg.id}</TableCell>
                  <TableCell>
                    <Typography fontWeight={600}>{pkg.name}</Typography>
                    {pkg.description && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", maxWidth: 200 }}>
                        {pkg.description.length > 60 ? `${pkg.description.slice(0, 60)}...` : pkg.description}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{formatCurrency(pkg.price)}</TableCell>
                  <TableCell>{pkg.quotaRequests.toLocaleString()} requests</TableCell>
                  <TableCell>
                    {pkg.durationMonths != null ? `${pkg.durationMonths} month(s)` : "Lifetime"}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={pkg.isActive ? "Active" : "Inactive"}
                      color={pkg.isActive ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={0.5} justifyContent="center">
                      <Tooltip title="Edit">
                        <IconButton size="small" color="primary" onClick={() => handleOpenEdit(pkg)}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {pkg.isActive && (
                        <Tooltip title="Deactivate package">
                          <IconButton size="small" color="warning" onClick={() => setDeactivateTarget(pkg)}>
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

      <TierPackageFormDialog
        open={formOpen}
        saving={saving}
        editTarget={editTarget}
        onClose={() => setFormOpen(false)}
        onCreate={addPackage}
        onUpdate={editPackage}
      />

      <Dialog open={deactivateTarget !== null} onClose={() => setDeactivateTarget(null)} maxWidth="xs">
        <DialogTitle>Confirm Deactivation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to deactivate <strong>{deactivateTarget?.name}</strong>? The package will
            no longer be visible to new users but will not affect existing subscriptions.
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
