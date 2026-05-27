"use client";

import React, { useCallback, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { Refresh } from "@mui/icons-material";
import ManagementHeader from "@/components/layout/ManagementHeader";
import { hoverLiftStyle } from "@/lib/styles/buttonStyles";
import { triggerMonthlyResetAll } from "@/lib/api/aiQuotaService";
import TierPackagesTab from "./TierPackagesTab";
import TierThresholdsTab from "./TierThresholdsTab";

export default function AiPackageManagementPageClient() {
  const [activeTab, setActiveTab] = useState(0);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleResetAll = useCallback(async () => {
    setResetting(true);
    setResetError(null);
    setResetSuccess(false);
    try {
      await triggerMonthlyResetAll(true);
      setResetSuccess(true);
      setResetDialogOpen(false);
    } catch (err) {
      const candidate = err as { response?: { data?: { message?: string } }; message?: string };
      setResetError(candidate.response?.data?.message || candidate.message || "An error occurred");
    } finally {
      setResetting(false);
    }
  }, []);

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <ManagementHeader
        title="AI Package Management"
        description="Manage AI packages, membership tier thresholds, and quota."
        entityLabel=""
      />

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_e, val: number) => setActiveTab(val)}
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label="AI Packages" />
          <Tab label="Tier Thresholds" />
        </Tabs>

        <Button
          variant="outlined"
          color="warning"
          startIcon={<Refresh />}
          onClick={() => setResetDialogOpen(true)}
          sx={{ ...hoverLiftStyle }}
        >
          Reset Monthly Quota (All Users)
        </Button>
      </Box>

      {resetSuccess && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setResetSuccess(false)}>
          Monthly quota reset successfully for all users.
        </Alert>
      )}
      {resetError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setResetError(null)}>
          {resetError}
        </Alert>
      )}

      {activeTab === 0 && <TierPackagesTab />}
      {activeTab === 1 && <TierThresholdsTab />}

      <Dialog open={resetDialogOpen} onClose={() => setResetDialogOpen(false)} maxWidth="xs">
        <DialogTitle>Confirm Quota Reset</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will <strong>reset the monthly AI quota</strong> for all customers. This action cannot
            be undone. Are you sure you want to continue?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialogOpen(false)} disabled={resetting}>
            Cancel
          </Button>
          <Button variant="contained" color="warning" onClick={handleResetAll} disabled={resetting}>
            {resetting ? "Processing..." : "Confirm Reset"}
          </Button>
        </DialogActions>
      </Dialog>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 4, display: "block" }}>
        * Deactivating a package hides it from the purchase list but does not affect existing subscriptions.
      </Typography>
    </Box>
  );
}
