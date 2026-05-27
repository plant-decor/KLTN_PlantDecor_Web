"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { History } from "@mui/icons-material";
import useTierPackages from "@/hooks/useTierPackages";
import useAiQuota from "@/hooks/useAiQuota";
import TierPackageCard from "./TierPackageCard";
import AIQuotaWidget from "./AIQuotaWidget";
import AiQuotaModal from "./AiQuotaModal";

export default function AiPackagesPageClient() {
  const [quotaModalOpen, setQuotaModalOpen] = useState(false);

  const { packages, loading, purchasing, error, fetchPackages, purchasePackage, clearError } =
    useTierPackages();
  const { quotaStatus, fetchQuota } = useAiQuota();

  useEffect(() => {
    fetchPackages();
    fetchQuota();
  }, [fetchPackages, fetchQuota]);

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", px: { xs: 2, md: 4 }, py: { xs: 3, md: 6 } }}>
      <Stack spacing={4}>
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="outlined"
            startIcon={<History />}
            onClick={() => setQuotaModalOpen(true)}
          >
            View Subscription History
          </Button>
        </Box>

        <Box sx={{ textAlign: "center" }}>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            Upgrade Your AI Experience
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 580, mx: "auto" }}>
            Purchase additional quota to unlock AI features such as style recommendations, plant
            care advice, and much more.
          </Typography>
        </Box>

        {quotaStatus && <AIQuotaWidget quotaStatus={quotaStatus} />}

        {error && (
          <Alert severity="error" onClose={clearError}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : packages.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <Typography color="text.secondary">No AI packages available at the moment.</Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {packages.map((pkg) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={pkg.id}>
                <TierPackageCard
                  pkg={pkg}
                  onPurchase={purchasePackage}
                  globalPurchasing={purchasing}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Stack>

      <AiQuotaModal open={quotaModalOpen} onClose={() => setQuotaModalOpen(false)} />
    </Box>
  );
}
